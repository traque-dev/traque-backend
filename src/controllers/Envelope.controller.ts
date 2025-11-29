import { SentryProject } from 'core/decorators/SentryProject.decorator';
import { BadRequestException } from 'core/exceptions/BadRequest.exception';

import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';

import { InjectQueue } from '@nestjs/bullmq';
import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  INGEST_EVENT_JOB,
  INGEST_QUEUE,
} from 'queues/ingest/IngestQueue.constants';

import { Project } from 'models/entity/Project.entity';

import type { Queue } from 'bullmq';
import type { Request } from 'express';
import type { IngestEventJobData } from 'queues/ingest/IngestQueue.types';

type EnvelopeHeaders = {
  event_id?: string;
};

type EnvelopeItemHeader = {
  type: string;
  length?: number;
  content_type?: string;
};

type EnvelopeItem = {
  header: EnvelopeItemHeader;
  payload: Buffer;
};

type ParsedEnvelope = {
  header: EnvelopeHeaders;
  items: EnvelopeItem[];
};

type SentryEventPayload = Record<string, unknown> & {
  event_id?: string;
};

type ParsedLineResult = {
  line: Buffer;
  nextOffset: number;
};

const gunzipAsync = promisify(gunzip);

@Controller('/:projectId/envelope')
export class EnvelopeController {
  constructor(
    @InjectQueue(INGEST_QUEUE)
    private readonly ingestQueue: Queue<IngestEventJobData>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async ingestEnvelope(
    @Req() request: Request,
    @SentryProject() project: Project,
  ) {
    const rawBody = await this.readBody(request);

    if (!rawBody.length) {
      throw new BadRequestException({
        message: 'Envelope body is empty',
      });
    }

    const envelopeBuffer = await this.maybeDecompress(
      rawBody,
      this.getHeaderValue(request, 'content-encoding'),
    );
    const envelope = this.parseEnvelope(envelopeBuffer);

    const eventItems = envelope.items.filter(
      (item) => item.header.type === 'event',
    );

    if (eventItems.length === 0) {
      return {
        id: envelope.header.event_id ?? randomUUID(),
      };
    }

    const now = new Date().toISOString();
    const acceptedEventIds: string[] = [];

    await Promise.all(
      eventItems.map(async (item) => {
        const payload = this.parseEventPayload(item);
        const eventId = this.extractEventId(payload, envelope.header.event_id);

        if (eventId) {
          acceptedEventIds.push(eventId);
        }

        await this.ingestQueue.add(
          INGEST_EVENT_JOB,
          {
            projectId: project.id,
            eventId,
            eventPayload: payload,
            receivedAt: now,
          },
          {
            removeOnComplete: true,
            removeOnFail: false,
          },
        );
      }),
    );

    const responseId =
      acceptedEventIds[0] ?? envelope.header.event_id ?? randomUUID();

    return {
      id: responseId,
    };
  }

  private async readBody(request: Request): Promise<Buffer> {
    if (Buffer.isBuffer(request.body)) {
      return request.body;
    }

    if (typeof request.body === 'string') {
      return Buffer.from(request.body);
    }

    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];

      request.on('data', (chunk: Buffer | string) => {
        if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk));
        } else {
          chunks.push(chunk);
        }
      });

      request.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      request.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  private async maybeDecompress(
    buffer: Buffer,
    encoding?: string,
  ): Promise<Buffer> {
    if (!encoding) {
      return buffer;
    }

    if (encoding.toLowerCase().includes('gzip')) {
      return await gunzipAsync(buffer);
    }

    return buffer;
  }

  private parseEnvelope(buffer: Buffer): ParsedEnvelope {
    const { line: headerLine, nextOffset } = this.readLine(buffer, 0);
    if (!headerLine.length) {
      throw new BadRequestException({
        message: 'Envelope header is missing',
      });
    }

    let cursor = nextOffset;
    const header = this.safeJsonParse<EnvelopeHeaders>(headerLine);
    const items: EnvelopeItem[] = [];

    while (cursor < buffer.length) {
      const { line: itemHeaderLine, nextOffset: afterHeader } = this.readLine(
        buffer,
        cursor,
      );
      cursor = afterHeader;

      if (!itemHeaderLine.length) {
        break;
      }

      const itemHeader = this.safeJsonParse<EnvelopeItemHeader>(itemHeaderLine);

      let payload: Buffer;

      if (typeof itemHeader.length === 'number') {
        if (cursor + itemHeader.length > buffer.length) {
          throw new BadRequestException({
            message: 'Envelope item length is invalid',
          });
        }

        payload = buffer.subarray(cursor, cursor + itemHeader.length);
        cursor += itemHeader.length;

        if (buffer[cursor] === 0x0a) {
          cursor += 1;
        }
      } else {
        const payloadLine = this.readLine(buffer, cursor);
        payload = payloadLine.line;
        cursor = payloadLine.nextOffset;
      }

      items.push({
        header: itemHeader,
        payload,
      });
    }

    return { header, items };
  }

  private readLine(buffer: Buffer, offset: number): ParsedLineResult {
    let cursor = offset;
    while (cursor < buffer.length && buffer[cursor] !== 0x0a) {
      cursor += 1;
    }

    let line = buffer.subarray(offset, cursor);
    if (line.length && line[line.length - 1] === 0x0d) {
      line = line.subarray(0, line.length - 1);
    }

    const nextOffset = cursor < buffer.length ? cursor + 1 : cursor;

    return {
      line,
      nextOffset,
    };
  }

  private parseEventPayload({ payload }: EnvelopeItem): SentryEventPayload {
    return this.safeJsonParse<SentryEventPayload>(payload);
  }

  private extractEventId(
    payload: SentryEventPayload,
    fallback?: string,
  ): string | undefined {
    if (typeof payload.event_id === 'string' && payload.event_id.length > 0) {
      return payload.event_id;
    }

    if (typeof fallback === 'string' && fallback.length > 0) {
      return fallback;
    }

    return undefined;
  }

  private safeJsonParse<T>(buffer: Buffer): T {
    try {
      return JSON.parse(buffer.toString('utf-8')) as T;
    } catch {
      throw new BadRequestException({
        message: 'Unable to parse envelope payload',
      });
    }
  }

  private getHeaderValue(
    request: Request,
    headerName: string,
  ): string | undefined {
    const value: string | string[] | undefined = request.header(headerName);

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return undefined;
  }
}

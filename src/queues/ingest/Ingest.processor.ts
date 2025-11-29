import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { ExceptionDTO } from 'models/dto/Exception.dto';
import { Project } from 'models/entity/Project.entity';
import { ExceptionService } from 'services/Exception.service';

import { INGEST_EVENT_JOB, INGEST_QUEUE } from './IngestQueue.constants';
import type { IngestEventJobData } from './IngestQueue.types';
import { mapSentryEventToException } from './SentryEvent.mapper';

@Processor(INGEST_QUEUE)
export class IngestProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestProcessor.name);

  constructor(
    private readonly exceptionService: ExceptionService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {
    super();
  }

  async process(job: Job<IngestEventJobData>): Promise<void> {
    if (job.name !== INGEST_EVENT_JOB) {
      return;
    }

    const { projectId, eventPayload } = job.data;

    if (!projectId || !eventPayload) {
      this.logger.warn(
        `Skipping job ${job.id} because of missing project or payload`,
      );

      return;
    }

    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      this.logger.warn(
        `Project ${projectId} is not found for event ${job.data.eventId ?? job.id}`,
      );

      return;
    }

    try {
      const exceptionDto: ExceptionDTO =
        mapSentryEventToException(eventPayload);

      await this.exceptionService.captureException(project, exceptionDto);
    } catch (error) {
      this.logger.error(
        `Failed to process Sentry event ${job.data.eventId ?? job.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}

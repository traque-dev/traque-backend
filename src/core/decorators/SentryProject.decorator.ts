import { getDataSource } from 'core/db/getDataSource';
import { BadRequestException } from 'core/exceptions/BadRequest.exception';
import { UnauthorizedException } from 'core/exceptions/Unauthorized.exception';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Project } from 'models/entity/Project.entity';

import type { Request } from 'express';

type SentryAuthDetails = {
  key?: string;
  projectId?: string;
};

const SENTRY_HEADER_PREFIX = 'sentry';

export const SentryProject = createParamDecorator(
  async (_: unknown, context: ExecutionContext): Promise<Project> => {
    const request: Request = context.switchToHttp().getRequest();
    const projectId = extractRouteProjectId(request);
    const authDetails = extractSentryAuth(request);

    if (!authDetails.key) {
      throw new UnauthorizedException({
        message: 'Missing Sentry authentication key',
      });
    }

    if (authDetails.projectId && authDetails.projectId !== projectId) {
      throw new UnauthorizedException({
        message: 'DSN project mismatch',
      });
    }

    const dataSource = await getDataSource();
    const project = await dataSource.getRepository(Project).findOne({
      where: {
        externalId: projectId,
        apiKey: authDetails.key,
      },
    });

    if (!project) {
      throw new UnauthorizedException({
        message: 'Invalid DSN or project',
      });
    }

    // @ts-expect-error augment request for downstream decorators
    request.project = project;

    return project;
  },
);

function extractRouteProjectId(request: Request): string {
  const routeProjectId = request.params?.projectId;

  if (!routeProjectId || typeof routeProjectId !== 'string') {
    throw new BadRequestException({
      message: 'Project id is required in the route',
    });
  }

  return routeProjectId;
}

function extractSentryAuth(request: Request): SentryAuthDetails {
  const headerAuth =
    request.header('x-sentry-auth') ?? request.header('authorization');

  if (headerAuth) {
    const headerDetails = parseHeaderAuth(headerAuth);

    if (headerDetails.key) {
      return headerDetails;
    }
  }

  const sentryKey = coerceQueryString(request.query?.sentry_key);
  if (sentryKey) {
    return {
      key: sentryKey,
      projectId: coerceQueryString(request.query?.project_id),
    };
  }

  const dsnParam = coerceQueryString(request.query?.dsn);
  if (dsnParam) {
    return parseDsn(dsnParam);
  }

  return {};
}

function parseHeaderAuth(header: string): SentryAuthDetails {
  const trimmedHeader = header.trim();

  if (!trimmedHeader.toLowerCase().startsWith(SENTRY_HEADER_PREFIX)) {
    return {};
  }

  const raw = trimmedHeader.slice(SENTRY_HEADER_PREFIX.length).trim();
  const withoutScheme = raw.startsWith(' ')
    ? raw.trim()
    : raw.replace(/^\s*/, '');
  const payload = withoutScheme.startsWith(' ')
    ? withoutScheme.trim()
    : withoutScheme;

  const kvPairs = payload.split(',').map((entry) => entry.trim());

  const entries = kvPairs.reduce<Record<string, string>>((acc, pair) => {
    const [key, value] = pair.split('=');

    if (key && value) {
      acc[key.trim()] = value.trim();
    }

    return acc;
  }, {});

  const dsnDetails = entries.dsn ? parseDsn(entries.dsn) : {};

  return {
    key: entries.sentry_key ?? dsnDetails.key,
    projectId: entries.project_id ?? dsnDetails.projectId,
  };
}

function coerceQueryString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return coerceQueryString(value[0]);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return value.toString(10);
  }

  return undefined;
}

function parseDsn(dsn: string): SentryAuthDetails {
  try {
    const url = new URL(dsn);
    const segments = url.pathname.replace(/^\//, '').split('/');
    const projectId = segments.pop();

    return {
      key: decodeURIComponent(url.username),
      projectId: projectId ?? undefined,
    };
  } catch {
    return {};
  }
}

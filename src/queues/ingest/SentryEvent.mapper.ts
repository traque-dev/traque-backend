import { ExceptionDTO } from 'models/dto/Exception.dto';
import { ExceptionFrameDTO } from 'models/dto/ExceptionFrame.dto';
import { HttpContextDTO } from 'models/dto/HttpContext.dto';
import { StacktraceDTO } from 'models/dto/Stacktrace.dto';
import { EventEnvironment } from 'models/types/EventEnvironment';
import { EventPlatform } from 'models/types/EventPlatform';
import { HttpRequestMethod } from 'models/types/HttpRequestMethod';

const ENVIRONMENT_MAP: Record<string, EventEnvironment> = {
  production: EventEnvironment.PRODUCTION,
  prod: EventEnvironment.PRODUCTION,
  staging: EventEnvironment.STAGING,
  stage: EventEnvironment.STAGING,
  development: EventEnvironment.DEVELOPMENT,
  dev: EventEnvironment.DEVELOPMENT,
  test: EventEnvironment.DEVELOPMENT,
};

const PLATFORM_MAP: Record<string, EventPlatform> = {
  javascript: EventPlatform.REACT,
  browser: EventPlatform.REACT,
  react: EventPlatform.REACT,
  'react-native': EventPlatform.REACT_NATIVE,
  expo: EventPlatform.EXPO,
  node: EventPlatform.NODE_JS,
  nodejs: EventPlatform.NODE_JS,
  'node-js': EventPlatform.NODE_JS,
  'node.js': EventPlatform.NODE_JS,
  nestjs: EventPlatform.NEST_JS,
  nextjs: EventPlatform.NEXT_JS,
  'next.js': EventPlatform.NEXT_JS,
  python: EventPlatform.PYTHON,
  java: EventPlatform.JAVA,
};

type SentryStackFrame = {
  filename?: string;
  abs_path?: string;
  function?: string;
  module?: string;
  lineno?: number;
  colno?: number;
  in_app?: boolean;
  platform?: string;
};

type SentryExceptionValue = {
  type?: string;
  value?: string;
  stacktrace?: {
    frames?: SentryStackFrame[];
  };
};

type SentryRequest = {
  url?: string;
  method?: string;
  status?: string;
  status_code?: number;
  response_status?: number;
  headers?: Record<string, unknown>;
  data?: unknown;
  body?: unknown;
  env?: Record<string, unknown>;
};

type RawSentryEvent = {
  environment?: string;
  platform?: string;
  message?: string | { formatted?: string };
  logentry?: { formatted?: string };
  exception?: {
    values?: SentryExceptionValue[];
  };
  request?: SentryRequest;
  user?: {
    ip_address?: string;
  };
  extra?: Record<string, unknown>;
  contexts?: {
    extra?: Record<string, unknown>;
  };
} & Record<string, unknown>;

export function mapSentryEventToException(
  eventPayload: RawSentryEvent,
): ExceptionDTO {
  const exceptionValue = extractPrimaryException(eventPayload);
  const environment = mapEnvironment(eventPayload.environment);
  const platform = mapPlatform(eventPayload.platform);
  const message = extractMessage(eventPayload, exceptionValue);

  const exceptionDto = new ExceptionDTO({
    environment,
    name: exceptionValue?.type ?? 'Error',
    message,
    platform,
    details: extractDetails(eventPayload),
  });

  const stacktrace = buildStacktrace(exceptionValue);
  if (stacktrace) {
    exceptionDto.withStacktrace(stacktrace);
  }

  const httpContext = buildHttpContext(eventPayload);
  if (httpContext) {
    exceptionDto.withHttpContext(httpContext);
  }

  return exceptionDto;
}

function extractPrimaryException(
  eventPayload: RawSentryEvent,
): SentryExceptionValue | null {
  return eventPayload.exception?.values?.[0] ?? null;
}

function extractMessage(
  eventPayload: RawSentryEvent,
  exceptionValue: SentryExceptionValue | null,
) {
  if (exceptionValue?.value) {
    return exceptionValue.value;
  }

  if (typeof eventPayload.message === 'string') {
    return eventPayload.message;
  }

  if (eventPayload.message?.formatted) {
    return eventPayload.message.formatted;
  }

  if (typeof eventPayload.logentry?.formatted === 'string') {
    return eventPayload.logentry.formatted;
  }

  return 'Unknown error';
}

function extractDetails(eventPayload: RawSentryEvent) {
  if (typeof eventPayload.logentry?.formatted === 'string') {
    return eventPayload.logentry.formatted;
  }

  const extraDetails = eventPayload.extra ?? eventPayload.contexts?.extra;
  if (extraDetails && typeof extraDetails === 'object') {
    return JSON.stringify(extraDetails);
  }

  return undefined;
}

function mapEnvironment(environment?: string): EventEnvironment {
  if (!environment) {
    return EventEnvironment.PRODUCTION;
  }

  const normalized = environment.toLowerCase();

  return ENVIRONMENT_MAP[normalized] ?? EventEnvironment.PRODUCTION;
}

function mapPlatform(platform?: string): EventPlatform | undefined {
  if (!platform) {
    return undefined;
  }

  const normalized = platform.toLowerCase();

  return PLATFORM_MAP[normalized];
}

function buildStacktrace(exceptionValue: SentryExceptionValue | null) {
  const frames = exceptionValue?.stacktrace?.frames;

  if (!Array.isArray(frames) || frames.length === 0) {
    return undefined;
  }

  const frameDtos = frames.map(
    (frame, index) =>
      new ExceptionFrameDTO({
        frameIndex: index,
        filename: frame.filename ?? frame.abs_path,
        functionName: frame.function,
        lineNumber: frame.lineno,
        columnNumber: frame.colno,
        absolutePath: frame.abs_path,
        module: frame.module,
        inApp: frame.in_app,
        platform: frame.platform,
      }),
  );

  const stackLines = frames
    .map((frame) => {
      const fnName = frame.function ?? '<anonymous>';
      const location =
        frame.filename ?? frame.abs_path ?? frame.module ?? '<unknown>';
      const lineInfo = frame.lineno !== undefined ? `:${frame.lineno}` : '';
      const columnInfo = frame.colno !== undefined ? `:${frame.colno}` : '';

      return `    at ${fnName} (${location}${lineInfo}${columnInfo})`;
    })
    .join('\n');

  return new StacktraceDTO({
    stack: stackLines,
    frames: frameDtos,
  });
}

function buildHttpContext(eventPayload: RawSentryEvent) {
  const request = eventPayload.request;
  if (!request) {
    return undefined;
  }

  const forwardedFor = getHeaderString(request.headers, 'x-forwarded-for');
  const clientIp =
    eventPayload.user?.ip_address ??
    (forwardedFor ? forwardedFor.split(',')[0]?.trim() : undefined) ??
    getRemoteAddress(request.env);

  const method = mapHttpMethod(request.method);

  if (!method && !request.url) {
    return undefined;
  }

  return new HttpContextDTO({
    url: request.url,
    method,
    status: request.status,
    statusCode: request.status_code ?? request.response_status,
    clientIp,
    response: request.data ?? request.body,
  });
}

function mapHttpMethod(method?: string): HttpRequestMethod | undefined {
  if (!method) {
    return undefined;
  }

  const upper = method.toUpperCase();
  return HttpRequestMethod[upper as keyof typeof HttpRequestMethod];
}

function getHeaderString(
  headers: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }

  const normalizedKey = key.toLowerCase();
  const headerEntries = Object.entries(headers);
  for (const [headerKey, value] of headerEntries) {
    if (
      headerKey.toLowerCase() === normalizedKey &&
      typeof value === 'string'
    ) {
      return value;
    }
  }

  return undefined;
}

function getRemoteAddress(env?: Record<string, unknown>) {
  if (!env) {
    return undefined;
  }

  const remote = env.REMOTE_ADDR;

  return typeof remote === 'string' ? remote : undefined;
}

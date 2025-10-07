import { HttpStatus } from '@nestjs/common';

export type ExceptionConstructorParams = {
  message?: string;
  details?: string;
  path?: string;
  suggestion?: string;
};

export class ResponseError {
  code?: string;
  message?: string;
  details?: string;
  timestamp?: Date;
  path?: string;
  suggestion?: string;
}

const errorCodeMap = new Map<HttpStatus, string>([
  [HttpStatus.BAD_REQUEST, 'BAD_REQUEST'],
  [HttpStatus.CONFLICT, 'CONFLICT'],
  [HttpStatus.NOT_FOUND, 'NOT_FOUND'],
  [HttpStatus.FORBIDDEN, 'FORBIDDEN'],
  [HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'],
  [HttpStatus.NOT_ACCEPTABLE, 'NOT_ACCEPTABLE'],
  [HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'],
]);

export class ExceptionResponse {
  readonly status = 'error';

  statusCode: HttpStatus;
  error: ResponseError = new ResponseError();

  constructor(statusCode: HttpStatus) {
    this.statusCode = statusCode;

    this.error.timestamp = new Date();
    this.error.code = errorCodeMap.get(statusCode);
  }

  withMessage(message?: string) {
    this.error.message = message;

    return this;
  }

  withDetails(details?: string) {
    this.error.details = details;

    return this;
  }

  withSuggestion(suggestion?: string) {
    this.error.suggestion = suggestion;

    return this;
  }

  forPath(path?: string) {
    this.error.path = path;

    return this;
  }
}

import {
  ExceptionConstructorParams,
  ExceptionResponse,
} from 'core/exceptions/ExceptionResponse';

import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseHttpException extends HttpException {
  constructor(
    { message, details, suggestion, path }: ExceptionConstructorParams,
    httpStatus: HttpStatus,
  ) {
    super(
      new ExceptionResponse(httpStatus)
        .withMessage(message)
        .withDetails(details)
        .withSuggestion(suggestion)
        .forPath(path),
      httpStatus,
    );
  }
}

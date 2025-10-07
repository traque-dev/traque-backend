import { BaseHttpException } from 'core/exceptions/BaseHttp.exception';
import { ExceptionConstructorParams } from 'core/exceptions/ExceptionResponse';

import { HttpStatus } from '@nestjs/common';

export class BadRequestException extends BaseHttpException {
  constructor(params: ExceptionConstructorParams) {
    super(params, HttpStatus.BAD_REQUEST);
  }
}

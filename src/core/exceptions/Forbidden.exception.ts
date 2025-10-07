import { BaseHttpException } from 'core/exceptions/BaseHttp.exception';
import { ExceptionConstructorParams } from 'core/exceptions/ExceptionResponse';

import { HttpStatus } from '@nestjs/common';

export class ForbiddenException extends BaseHttpException {
  constructor(params: ExceptionConstructorParams) {
    super(params, HttpStatus.FORBIDDEN);
  }
}

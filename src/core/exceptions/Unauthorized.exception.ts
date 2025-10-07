import { BaseHttpException } from 'core/exceptions/BaseHttp.exception';
import { ExceptionConstructorParams } from 'core/exceptions/ExceptionResponse';

import { HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends BaseHttpException {
  constructor(params: ExceptionConstructorParams) {
    super(params, HttpStatus.UNAUTHORIZED);
  }
}

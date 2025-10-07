import { BadRequestException } from 'core/exceptions/BadRequest.exception';

import {
  Logger,
  ValidationError,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

export class ValidationPipe extends NestValidationPipe {
  private readonly logger: Logger = new Logger(ValidationPipe.name);

  public override createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      const errors = this.flattenValidationErrors(validationErrors);
      this.logger.error(
        `Validation error: ${JSON.stringify({ validationErrors })}`,
      );
      return new BadRequestException({
        message: errors.join(', '),
      });
    };
  }
}

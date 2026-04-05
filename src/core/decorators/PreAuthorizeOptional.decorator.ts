import { OptionalAuthGuard } from 'core/guards/OptionalAuth.guard';

import { applyDecorators, UseGuards } from '@nestjs/common';

export const PreAuthorizeOptional = () => {
  return applyDecorators(UseGuards(OptionalAuthGuard));
};

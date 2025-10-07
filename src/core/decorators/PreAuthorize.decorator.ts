import { AuthGuard } from 'core/guards/Auth.guard';

import { applyDecorators, UseGuards } from '@nestjs/common';

export const PreAuthorize = () => {
  return applyDecorators(UseGuards(AuthGuard));
};

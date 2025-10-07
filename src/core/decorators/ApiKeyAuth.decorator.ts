import { ApiKeyGuard } from 'core/guards/ApiKey.guard';

import { applyDecorators, UseGuards } from '@nestjs/common';

export const ApiKeyAuth = () => {
  return applyDecorators(UseGuards(ApiKeyGuard));
};

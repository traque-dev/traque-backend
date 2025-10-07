import { TraquePlusGuard } from 'core/guards/TraquePlus.guard';

import { UseGuards, applyDecorators } from '@nestjs/common';

export function TraquePlus() {
  return applyDecorators(UseGuards(TraquePlusGuard));
}

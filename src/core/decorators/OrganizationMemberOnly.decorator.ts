import { OrganizationMemberGuard } from 'core/guards/OrganizationMember.guard';

import { applyDecorators, UseGuards } from '@nestjs/common';

export const OrganizationMemberOnly = () => {
  return applyDecorators(UseGuards(OrganizationMemberGuard));
};

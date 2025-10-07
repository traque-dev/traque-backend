import { OrganizationMemberGuard } from 'core/guards/OrganizationMember.guard';
import { ProjectMemberGuard } from 'core/guards/ProjectMemberGuard.guard';

import { applyDecorators, UseGuards } from '@nestjs/common';

export const ProjectMemberOnly = () => {
  return applyDecorators(
    UseGuards(OrganizationMemberGuard, ProjectMemberGuard),
  );
};

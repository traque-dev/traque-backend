import {
  createPageableParams,
  PageableDefault,
} from 'core/decorators/PageableDefault.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Controller, Get, Param, ParseUUIDPipe, Version } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BugActivityDTO } from 'models/dto/BugActivity.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { BugActivity } from 'models/entity/BugActivity.entity';
import { BugActivityService } from 'services/BugActivity.service';

@ApiTags('Bug Activities')
@Controller(
  '/organizations/:organizationId/projects/:projectId/bugs/:bugId/activities',
)
export class BugActivityController {
  constructor(private readonly activityService: BugActivityService) {}

  @ApiOperation({ summary: 'List bug activity log' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getActivities(
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @PageableDefault(
      createPageableParams<BugActivity>({
        sortableColumns: ['createdAt'],
        defaultSortBy: { createdAt: 'DESC' },
      }),
    )
    pageable: Pageable<BugActivity>,
  ): Promise<PageDTO<BugActivityDTO>> {
    return this.activityService.paginateActivities(bugId, pageable);
  }
}

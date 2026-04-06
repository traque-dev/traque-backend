import { ApiResponsePage } from 'core/decorators/ApiResponsePage.decorator';
import {
  createPageableParams,
  PageableDefault,
} from 'core/decorators/PageableDefault.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Controller, Get, Param, ParseUUIDPipe, Version } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FeedbackActivityDTO } from 'models/dto/FeedbackActivity.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { FeedbackActivity } from 'models/entity/FeedbackActivity.entity';
import { FeedbackActivityService } from 'services/FeedbackActivity.service';

@ApiTags('Feedback Activities')
@Controller(
  '/organizations/:organizationId/projects/:projectId/feedback/:feedbackId/activities',
)
export class FeedbackActivityController {
  constructor(private readonly activityService: FeedbackActivityService) {}

  @ApiOperation({ summary: 'List feedback activity log' })
  @ApiResponsePage(FeedbackActivityDTO)
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getActivities(
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @PageableDefault(
      createPageableParams<FeedbackActivity>({
        sortableColumns: ['createdAt'],
        defaultSortBy: { createdAt: 'DESC' },
      }),
    )
    pageable: Pageable<FeedbackActivity>,
  ): Promise<PageDTO<FeedbackActivityDTO>> {
    return this.activityService.paginateActivities(feedbackId, pageable);
  }
}

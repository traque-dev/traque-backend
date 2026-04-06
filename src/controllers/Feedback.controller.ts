import { ApiResponsePage } from 'core/decorators/ApiResponsePage.decorator';
import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import {
  createPageableParams,
  PageableDefault,
} from 'core/decorators/PageableDefault.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';
import { Pageable } from 'core/interfaces/Pageable.interface';

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AssignFeedbackDTO } from 'models/dto/AssignFeedback.dto';
import { ChangeFeedbackPriorityDTO } from 'models/dto/ChangeFeedbackPriority.dto';
import { ChangeFeedbackStatusDTO } from 'models/dto/ChangeFeedbackStatus.dto';
import { CreateFeedbackDTO } from 'models/dto/CreateFeedback.dto';
import { FeedbackDTO } from 'models/dto/Feedback.dto';
import { FeedbackStatisticsDTO } from 'models/dto/FeedbackStatistics.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { UpdateFeedbackDTO } from 'models/dto/UpdateFeedback.dto';
import { Feedback } from 'models/entity/Feedback.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackFilters } from 'models/filters/Feedback.filter';
import { FeedbackService } from 'services/Feedback.service';

@ApiTags('Feedback')
@Controller('/organizations/:organizationId/projects/:projectId/feedback')
export class FeedbackController {
  private readonly logger: Logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({ summary: 'List feedback' })
  @ApiResponsePage(FeedbackDTO)
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getFeedback(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @PageableDefault(
      createPageableParams<Feedback>({
        sortableColumns: [
          'createdAt',
          'updatedAt',
          'title',
          'status',
          'priority',
          'type',
        ],
        defaultSortBy: { createdAt: 'DESC' },
      }),
    )
    pageable: Pageable<Feedback>,
    @Query() filters: FeedbackFilters,
  ): Promise<PageDTO<FeedbackDTO>> {
    this.logger.log(
      `Received get feedback request by user: ${user.id} with filters ${JSON.stringify(filters)}`,
    );

    return this.feedbackService.paginateFeedback(project, pageable, filters);
  }

  @ApiOperation({ summary: 'Get feedback statistics' })
  @ApiResponse({ type: FeedbackStatisticsDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/statistics')
  getStatistics(
    @CurrentProject() project: Project,
  ): Promise<FeedbackStatisticsDTO> {
    return this.feedbackService.getStatistics(project);
  }

  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiResponse({ type: FeedbackDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/:feedbackId')
  getFeedbackById(
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
  ): Promise<FeedbackDTO> {
    return this.feedbackService.getFeedbackById(project, feedbackId);
  }

  @ApiOperation({ summary: 'Create feedback' })
  @ApiResponse({ type: FeedbackDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/')
  createFeedback(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Body() dto: CreateFeedbackDTO,
  ): Promise<FeedbackDTO> {
    this.logger.log(`Received create feedback request by user: ${user.id}`);

    return this.feedbackService.createFeedback(project, user, dto);
  }

  @ApiOperation({ summary: 'Update feedback' })
  @ApiResponse({ type: FeedbackDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Patch('/:feedbackId')
  updateFeedback(
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Body() dto: UpdateFeedbackDTO,
  ): Promise<FeedbackDTO> {
    return this.feedbackService.updateFeedback(project, feedbackId, dto);
  }

  @ApiOperation({ summary: 'Change feedback status' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:feedbackId/status')
  async changeFeedbackStatus(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Body() dto: ChangeFeedbackStatusDTO,
  ): Promise<PositiveResponseDto> {
    await this.feedbackService.changeFeedbackStatus(
      project,
      feedbackId,
      dto.status,
      user,
    );

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Change feedback priority' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:feedbackId/priority')
  async changeFeedbackPriority(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Body() dto: ChangeFeedbackPriorityDTO,
  ): Promise<PositiveResponseDto> {
    await this.feedbackService.changeFeedbackPriority(
      project,
      feedbackId,
      dto.priority,
      user,
    );

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Assign or unassign feedback' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:feedbackId/assignee')
  async assignFeedback(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Body() dto: AssignFeedbackDTO,
  ): Promise<PositiveResponseDto> {
    await this.feedbackService.assignFeedback(
      project,
      feedbackId,
      dto.assigneeId,
      user,
    );

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Delete feedback' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:feedbackId')
  async deleteFeedback(
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
  ): Promise<PositiveResponseDto> {
    await this.feedbackService.deleteFeedback(project, feedbackId);

    return PositiveResponseDto.instance();
  }
}

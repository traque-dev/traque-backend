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
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateFeedbackCommentDTO } from 'models/dto/CreateFeedbackComment.dto';
import { FeedbackCommentDTO } from 'models/dto/FeedbackComment.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { UpdateFeedbackCommentDTO } from 'models/dto/UpdateFeedbackComment.dto';
import { FeedbackComment } from 'models/entity/FeedbackComment.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackService } from 'services/Feedback.service';
import { FeedbackCommentService } from 'services/FeedbackComment.service';

@ApiTags('Feedback Comments')
@Controller(
  '/organizations/:organizationId/projects/:projectId/feedback/:feedbackId/comments',
)
export class FeedbackCommentController {
  constructor(
    private readonly commentService: FeedbackCommentService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @ApiOperation({ summary: 'List comments for a feedback' })
  @ApiResponsePage(FeedbackCommentDTO)
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getComments(
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @PageableDefault(
      createPageableParams<FeedbackComment>({
        sortableColumns: ['createdAt'],
        defaultSortBy: { createdAt: 'ASC' },
      }),
    )
    pageable: Pageable<FeedbackComment>,
  ): Promise<PageDTO<FeedbackCommentDTO>> {
    return this.commentService.paginateComments(feedbackId, pageable);
  }

  @ApiOperation({ summary: 'Add a comment to feedback' })
  @ApiResponse({ type: FeedbackCommentDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/')
  async createComment(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Body() dto: CreateFeedbackCommentDTO,
  ): Promise<FeedbackCommentDTO> {
    const feedback = await this.feedbackService.findFeedbackOrThrow(
      project,
      feedbackId,
    );

    return this.commentService.createComment(feedback, user, dto);
  }

  @ApiOperation({ summary: 'Edit a feedback comment' })
  @ApiResponse({ type: FeedbackCommentDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Patch('/:commentId')
  updateComment(
    @Principal() user: User,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateFeedbackCommentDTO,
  ): Promise<FeedbackCommentDTO> {
    return this.commentService.updateComment(feedbackId, commentId, user, dto);
  }

  @ApiOperation({ summary: 'Delete a feedback comment' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:commentId')
  async deleteComment(
    @Principal() user: User,
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<PositiveResponseDto> {
    await this.commentService.deleteComment(feedbackId, commentId, user);

    return PositiveResponseDto.instance();
  }
}

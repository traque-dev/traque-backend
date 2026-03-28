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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BugCommentDTO } from 'models/dto/BugComment.dto';
import { CreateBugCommentDTO } from 'models/dto/CreateBugComment.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { UpdateBugCommentDTO } from 'models/dto/UpdateBugComment.dto';
import { BugComment } from 'models/entity/BugComment.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { BugService } from 'services/Bug.service';
import { BugCommentService } from 'services/BugComment.service';

@ApiTags('Bug Comments')
@Controller(
  '/organizations/:organizationId/projects/:projectId/bugs/:bugId/comments',
)
export class BugCommentController {
  constructor(
    private readonly commentService: BugCommentService,
    private readonly bugService: BugService,
  ) {}

  @ApiOperation({ summary: 'List comments for a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getComments(
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @PageableDefault(
      createPageableParams<BugComment>({
        sortableColumns: ['createdAt'],
        defaultSortBy: { createdAt: 'ASC' },
      }),
    )
    pageable: Pageable<BugComment>,
  ): Promise<PageDTO<BugCommentDTO>> {
    return this.commentService.paginateComments(bugId, pageable);
  }

  @ApiOperation({ summary: 'Add a comment' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/')
  async createComment(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: CreateBugCommentDTO,
  ): Promise<BugCommentDTO> {
    const bug = await this.bugService.findBugOrThrow(project, bugId);

    return this.commentService.createComment(bug, user, dto);
  }

  @ApiOperation({ summary: 'Edit a comment' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Patch('/:commentId')
  async updateComment(
    @Principal() user: User,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateBugCommentDTO,
  ): Promise<BugCommentDTO> {
    return this.commentService.updateComment(bugId, commentId, user, dto);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:commentId')
  async deleteComment(
    @Principal() user: User,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<PositiveResponseDto> {
    await this.commentService.deleteComment(bugId, commentId, user);

    return PositiveResponseDto.instance();
  }
}

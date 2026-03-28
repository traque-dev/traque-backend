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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AddBugLabelDTO } from 'models/dto/AddBugLabel.dto';
import { AssignBugDTO } from 'models/dto/AssignBug.dto';
import { BugDTO } from 'models/dto/Bug.dto';
import { ChangeBugPriorityDTO } from 'models/dto/ChangeBugPriority.dto';
import { ChangeBugStatusDTO } from 'models/dto/ChangeBugStatus.dto';
import { CreateBugDTO } from 'models/dto/CreateBug.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { UpdateBugDTO } from 'models/dto/UpdateBug.dto';
import { Bug } from 'models/entity/Bug.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { BugFilters } from 'models/filters/Bug.filter';
import { BugService } from 'services/Bug.service';

@ApiTags('Bugs')
@Controller('/organizations/:organizationId/projects/:projectId/bugs')
export class BugController {
  private readonly logger: Logger = new Logger(BugController.name);

  constructor(private readonly bugService: BugService) {}

  @ApiOperation({ summary: 'List bugs' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getBugs(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @PageableDefault(
      createPageableParams<Bug>({
        sortableColumns: [
          'createdAt',
          'updatedAt',
          'title',
          'status',
          'priority',
        ],
        defaultSortBy: { createdAt: 'DESC' },
      }),
    )
    pageable: Pageable<Bug>,
    @Query() filters: BugFilters,
  ): Promise<PageDTO<BugDTO>> {
    this.logger.log(
      `Received get bugs request by user: ${user.id} with filters ${JSON.stringify(filters)}`,
    );

    return this.bugService.paginateBugs(project, pageable, filters);
  }

  @ApiOperation({ summary: 'Get bug statistics' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/statistics')
  getStatistics(@CurrentProject() project: Project) {
    return this.bugService.getStatistics(project);
  }

  @ApiOperation({ summary: 'Get bug by ID' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/:bugId')
  getBugById(
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
  ): Promise<BugDTO> {
    return this.bugService.getBugById(project, bugId);
  }

  @ApiOperation({ summary: 'Create a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/')
  createBug(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Body() dto: CreateBugDTO,
  ): Promise<BugDTO> {
    this.logger.log(`Received create bug request by user: ${user.id}`);

    return this.bugService.createBug(project, user, dto);
  }

  @ApiOperation({ summary: 'Update a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Patch('/:bugId')
  updateBug(
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: UpdateBugDTO,
  ): Promise<BugDTO> {
    return this.bugService.updateBug(project, bugId, dto);
  }

  @ApiOperation({ summary: 'Change bug status' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:bugId/status')
  async changeBugStatus(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: ChangeBugStatusDTO,
  ): Promise<PositiveResponseDto> {
    await this.bugService.changeBugStatus(project, bugId, dto.status, user);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Change bug priority' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:bugId/priority')
  async changeBugPriority(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: ChangeBugPriorityDTO,
  ): Promise<PositiveResponseDto> {
    await this.bugService.changeBugPriority(project, bugId, dto.priority, user);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Assign or unassign a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:bugId/assignee')
  async assignBug(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: AssignBugDTO,
  ): Promise<PositiveResponseDto> {
    await this.bugService.assignBug(project, bugId, dto.assigneeId, user);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Add a label to a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/:bugId/labels')
  async addLabel(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: AddBugLabelDTO,
  ): Promise<PositiveResponseDto> {
    await this.bugService.addLabel(project, bugId, dto.labelId, user);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Remove a label from a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:bugId/labels/:labelId')
  async removeLabel(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<PositiveResponseDto> {
    await this.bugService.removeLabel(project, bugId, labelId, user);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Delete a bug' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:bugId')
  async deleteBug(
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
  ): Promise<PositiveResponseDto> {
    await this.bugService.deleteBug(project, bugId);

    return PositiveResponseDto.instance();
  }
}

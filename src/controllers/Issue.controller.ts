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
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ChangeIssueSeverityDTO } from 'models/dto/ChangeIssueSeverity.dto';
import { ChangeIssueStatusDTO } from 'models/dto/ChangeIssueStatus.dto';
import { IssueDTO } from 'models/dto/Issue.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Issue } from 'models/entity/Issue.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { IssueFilters } from 'models/filters/Issue.filter';
import { IssueService } from 'services/Issue.service';

@ApiTags('Issues')
@Controller('/organizations/:organizationId/projects/:projectId/issues')
export class IssueController {
  private readonly logger: Logger = new Logger(IssueController.name);

  constructor(private readonly issueService: IssueService) {}

  @ApiOperation({
    summary: 'Get paginated list of project issues',
    description:
      'Retrieves a paginated list of issues for a specific project. Supports filtering, sorting, and pagination.',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getIssues(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @PageableDefault(
      createPageableParams<Issue>({
        sortableColumns: [
          'createdAt',
          'firstSeen',
          'lastSeen',
          'eventCount',
          'status',
          'severity',
          'name',
        ],
        defaultSortBy: {
          createdAt: 'DESC',
        },
      }),
    )
    pageable: Pageable<Issue>,
    @Query() filters: IssueFilters,
  ): Promise<PageDTO<IssueDTO>> {
    this.logger.log(
      `Received get project '${project.id}' issues request by user: ${user.id} with filters ${JSON.stringify(filters)}`,
    );

    return this.issueService.paginateProjectIssues(project, pageable, filters);
  }

  @ApiOperation({
    summary: 'Get issue by ID',
    description:
      'Retrieves detailed information about a specific issue by its ID.',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/:issueId')
  getIssueById(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('issueId', ParseUUIDPipe) issueId: IssueDTO['id'],
  ): Promise<IssueDTO> {
    this.logger.log(
      `Received get issue by id '${issueId}' request by user: ${user.id}`,
    );

    return this.issueService.getIssueById(project, issueId);
  }

  @ApiOperation({
    summary: 'Change issue status',
    description:
      'Updates the status of a specific issue. Valid status values include open, in_progress, resolved, and closed.',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:issueId/status')
  async changeIssueStatus(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('issueId') issueId: IssueDTO['id'],
    @Body() changeIssueStatusDTO: ChangeIssueStatusDTO,
  ): Promise<PositiveResponseDto> {
    const { status } = changeIssueStatusDTO;

    this.logger.log(
      `Received Change Issue '${issueId}' Status Request by User '${user.id}' to ${status}`,
    );

    await this.issueService.changeIssueStatus(project, issueId, status);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({
    summary: 'Change issue severity',
    description:
      'Updates the severity level of a specific issue. Valid severity values include low, medium, high, and critical.',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:issueId/severity')
  async changeIssueSeverity(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('issueId') issueId: IssueDTO['id'],
    @Body() changeIssueSeverityDTO: ChangeIssueSeverityDTO,
  ): Promise<PositiveResponseDto> {
    const { severity } = changeIssueSeverityDTO;

    this.logger.log(
      `Received Change Issue '${issueId}' Severity Request by User '${user.id}' to ${severity}`,
    );

    await this.issueService.changeIssueSeverity(project, issueId, severity);

    return PositiveResponseDto.instance();
  }
}

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
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ExceptionDTO } from 'models/dto/Exception.dto';
import { IssueDTO } from 'models/dto/Issue.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Exception } from 'models/entity/Exception.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { ExceptionService } from 'services/Exception.service';

@ApiTags('Exceptions')
@Controller('/organizations/:organizationId/projects/:projectId/exceptions')
export class ExceptionController {
  private readonly logger: Logger = new Logger(ExceptionController.name);

  constructor(private readonly exceptionService: ExceptionService) {}

  @ApiOperation({
    summary: 'Get project exceptions',
    description:
      'Retrieve paginated list of exceptions for a specific project. Supports filtering by issue ID and pagination.',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get()
  getExceptions(
    @PageableDefault(
      createPageableParams<Exception>({
        sortableColumns: ['createdAt', 'updatedAt', 'name'],
        defaultSortBy: {
          createdAt: 'DESC',
        },
      }),
    )
    pageable: Pageable<Exception>,
    @CurrentProject() project: Project,
    @Query('issueId') issueId: IssueDTO['id'],
  ): Promise<PageDTO<ExceptionDTO>> {
    this.logger.log(
      `Received paginate exceptions request with params: ${JSON.stringify({
        pageable,
        issueId,
      })}`,
    );

    return this.exceptionService.paginateExceptions(project, pageable, issueId);
  }

  @ApiOperation({
    summary: 'Get exception by ID',
    description:
      'Retrieve a specific exception by its ID within the project scope.',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/:exceptionId')
  getExceptionById(
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Param('exceptionId', ParseUUIDPipe) exceptionId: ExceptionDTO['id'],
  ): Promise<ExceptionDTO> {
    this.logger.log(
      `Received get exception by id '${exceptionId}' by user '${user.id}' request for project '${project.id}'`,
    );

    return this.exceptionService.getExceptionById(project, exceptionId);
  }
}

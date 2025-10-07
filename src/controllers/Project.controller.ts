import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';

import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OrganizationDTO } from 'models/dto/Organization.dto';
import { ProjectDTO } from 'models/dto/Project.dto';
import { User } from 'models/entity/User.entity';
import { ProjectMapper } from 'models/mappers/Project.mapper';
import { ProjectService } from 'services/Project.service';

@ApiTags('Projects')
@Controller('/organizations/:organizationId/projects')
export class ProjectController {
  private readonly logger: Logger = new Logger(ProjectController.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly projectMapper: ProjectMapper,
  ) {}

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get()
  getProjects(
    @Principal() user: User,
    @Param('organizationId') organizationId: OrganizationDTO['id'],
  ): Promise<ProjectDTO[]> {
    this.logger.log(`Received get projects request for user: ${user.id}`);

    return this.projectService.getUserProjects(user, organizationId);
  }

  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/:projectId')
  async getProjectById(
    @Principal() user: User,
    @Param('organizationId') organizationId: OrganizationDTO['id'],
    @Param('projectId') projectId: ProjectDTO['id'],
  ): Promise<ProjectDTO> {
    this.logger.log(
      `Received get project by ID '${projectId}' request for user: ${user.id}`,
    );

    const project = await this.projectService.getUserProjectById(
      user,
      organizationId,
      projectId,
    );

    return this.projectMapper.toDTO(project);
  }

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post()
  async createProject(
    @Principal() user: User,
    @Param('organizationId') organizationId: OrganizationDTO['id'],
    @Body() projectDTO: ProjectDTO,
  ): Promise<ProjectDTO> {
    this.logger.log(
      `Received Create Project Request for Organization ${organizationId} by User ${user.id}`,
    );

    return this.projectMapper.toDTO(
      await this.projectService.createProject(user, organizationId, projectDTO),
    );
  }
}

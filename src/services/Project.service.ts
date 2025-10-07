import { ForbiddenException } from 'core/exceptions/Forbidden.exception';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationDTO } from 'models/dto/Organization.dto';
import { ProjectDTO } from 'models/dto/Project.dto';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { ProjectMapper } from 'models/mappers/Project.mapper';
import { ApiKeyService } from 'services/ApiKey.service';
import { OrganizationService } from 'services/Organization.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly organizationService: OrganizationService,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly projectMapper: ProjectMapper,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async getUserProjects(
    user: User,
    organizationId: OrganizationDTO['id'],
  ): Promise<ProjectDTO[]> {
    const organization = await this.organizationService.getUserOrganizationById(
      user.id,
      organizationId,
    );

    const projects = await this.projectRepo.find({
      where: {
        organization: {
          id: organization.id,
        },
      },
    });

    return projects.map((project) => this.projectMapper.toDTO(project));
  }

  async getUserProjectById(
    user: User,
    organizationId: OrganizationDTO['id'],
    projectId: ProjectDTO['id'],
  ): Promise<Project> {
    const organization = await this.organizationService.getUserOrganizationById(
      user.id,
      organizationId,
    );

    const project = await this.projectRepo.findOne({
      where: {
        id: projectId,
        organization: {
          id: organization.id,
        },
      },
    });

    if (!project) {
      throw new ForbiddenException({
        message:
          "You don't have an access to this project or project doesn't exist",
      });
    }

    return project;
  }

  async createProject(
    user: User,
    organizationId: OrganizationDTO['id'],
    { name, description, platform, slug }: ProjectDTO,
  ): Promise<Project> {
    const organization = await this.organizationService.getUserOrganizationById(
      user.id,
      organizationId,
    );

    const apiKey = this.apiKeyService.generateKey({
      length: 64,
      prefix: this.apiKeyService.prefix,
    });

    const project = new Project({
      organization,
      apiKey,
      description,
      name,
      platform,
      slug,
    });

    return await this.projectRepo.save(project);
  }
}

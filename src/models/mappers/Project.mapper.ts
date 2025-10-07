import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { ProjectDTO } from 'models/dto/Project.dto';
import { Project } from 'models/entity/Project.entity';

@Injectable()
export class ProjectMapper implements BaseMapper<Project, ProjectDTO> {
  toDTO(entity: Project): ProjectDTO {
    return new ProjectDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      description: entity.description,
      platform: entity.platform,
      slug: entity.slug,
      apiKey: entity.apiKey,
    });
  }

  toEntity(): Project | Promise<Project> {
    throw new Error('Method not implemented.');
  }
}

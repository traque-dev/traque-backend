import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { BugDTO } from 'models/dto/Bug.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Bug } from 'models/entity/Bug.entity';
import { BugLabelMapper } from 'models/mappers/BugLabel.mapper';
import { BugReproductionStepMapper } from 'models/mappers/BugReproductionStep.mapper';

@Injectable()
export class BugMapper implements BaseMapper<Bug, BugDTO> {
  constructor(
    private readonly labelMapper: BugLabelMapper,
    private readonly stepMapper: BugReproductionStepMapper,
  ) {}

  toDTO(entity: Bug): BugDTO {
    return new BugDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      environment: entity.environment,
      expectedBehavior: entity.expectedBehavior,
      actualBehavior: entity.actualBehavior,
      browserContext: entity.browserContext,
      serverContext: entity.serverContext,
      breadcrumbs: entity.breadcrumbs,
      metadata: entity.metadata,
      source: entity.source,
      reporterId: entity.reporter?.id,
      reporterName: entity.reporter?.name,
      assigneeId: entity.assignee?.id,
      assigneeName: entity.assignee?.name,
      exceptionId: entity.exception?.id,
      labels: entity.labels?.map((label) => this.labelMapper.toDTO(label)),
      steps: entity.steps
        ?.sort((a, b) => a.order - b.order)
        .map((step) => this.stepMapper.toDTO(step)),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntity(dto: BugDTO): Bug | Promise<Bug> {
    throw new Error('Method not implemented.');
  }

  mapToPage(
    paginationEntity: Pagination<Bug, IPaginationMeta>,
  ): PageDTO<BugDTO> {
    return new PageDTO<BugDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

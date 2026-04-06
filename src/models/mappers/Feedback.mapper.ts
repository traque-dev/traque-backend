import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { FeedbackDTO } from 'models/dto/Feedback.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Feedback } from 'models/entity/Feedback.entity';

@Injectable()
export class FeedbackMapper implements BaseMapper<Feedback, FeedbackDTO> {
  toDTO(entity: Feedback): FeedbackDTO {
    return new FeedbackDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      status: entity.status,
      priority: entity.priority,
      impact: entity.impact,
      source: entity.source,
      submitterName: entity.submitterName,
      submitterEmail: entity.submitterEmail,
      metadata: entity.metadata,
      reporterId: entity.reporter?.id,
      reporterName: entity.reporter?.name,
      assigneeId: entity.assignee?.id,
      assigneeName: entity.assignee?.name,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntity(dto: FeedbackDTO): Feedback | Promise<Feedback> {
    throw new Error('Method not implemented.');
  }

  mapToPage(
    paginationEntity: Pagination<Feedback, IPaginationMeta>,
  ): PageDTO<FeedbackDTO> {
    return new PageDTO<FeedbackDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

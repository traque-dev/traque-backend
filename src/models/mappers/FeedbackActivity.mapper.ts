import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { FeedbackActivityDTO } from 'models/dto/FeedbackActivity.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { FeedbackActivity } from 'models/entity/FeedbackActivity.entity';

@Injectable()
export class FeedbackActivityMapper {
  toDTO(entity: FeedbackActivity): FeedbackActivityDTO {
    return new FeedbackActivityDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      type: entity.type,
      oldValue: entity.oldValue,
      newValue: entity.newValue,
      actorId: entity.actor?.id,
      actorName: entity.actor?.name,
    });
  }

  mapToPage(
    paginationEntity: Pagination<FeedbackActivity, IPaginationMeta>,
  ): PageDTO<FeedbackActivityDTO> {
    return new PageDTO<FeedbackActivityDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

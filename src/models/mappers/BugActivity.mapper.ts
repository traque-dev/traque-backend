import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { BugActivityDTO } from 'models/dto/BugActivity.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { BugActivity } from 'models/entity/BugActivity.entity';

@Injectable()
export class BugActivityMapper {
  toDTO(entity: BugActivity): BugActivityDTO {
    return new BugActivityDTO({
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
    paginationEntity: Pagination<BugActivity, IPaginationMeta>,
  ): PageDTO<BugActivityDTO> {
    return new PageDTO<BugActivityDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

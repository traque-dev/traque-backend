import { ToDoException } from 'core/exceptions/ToDo.exception';
import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { PageDTO } from 'models/dto/Page.dto';
import { ShortLinkClickDTO } from 'models/dto/shortlink/ShortLinkClick.dto';
import { ShortLinkClick } from 'models/entity/shortlink/ShortLinkClick.entity';

import type { Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class ShortLinkClickMapper
  implements BaseMapper<ShortLinkClick, ShortLinkClickDTO>
{
  toDTO(entity: ShortLinkClick): ShortLinkClickDTO {
    return new ShortLinkClickDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      clickedAt: entity.clickedAt,
      country: entity.country,
      region: entity.region,
      city: entity.city,
      deviceType: entity.deviceType,
      browser: entity.browser,
      os: entity.os,
      refererDomain: entity.refererDomain,
      language: entity.language,
      isBot: entity.isBot,
    });
  }

  toEntity(): ShortLinkClick {
    throw new ToDoException();
  }

  mapToPage(
    paginationEntity: Pagination<ShortLinkClick>,
  ): PageDTO<ShortLinkClickDTO> {
    return new PageDTO<ShortLinkClickDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

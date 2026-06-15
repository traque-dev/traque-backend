import { ToDoException } from 'core/exceptions/ToDo.exception';
import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { PageDTO } from 'models/dto/Page.dto';
import { ShortLinkDTO } from 'models/dto/shortlink/ShortLink.dto';
import { ShortLink } from 'models/entity/shortlink/ShortLink.entity';

import type { Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class ShortLinkMapper implements BaseMapper<ShortLink, ShortLinkDTO> {
  toDTO(entity: ShortLink): ShortLinkDTO {
    return new ShortLinkDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      slug: entity.slug,
      domain: entity.domain,
      shortUrl: `https://${entity.domain}/${entity.slug}`,
      destinationUrl: entity.destinationUrl,
      title: entity.title,
      description: entity.description,
      isActive: entity.isActive,
      expiresAt: entity.expiresAt,
      clickLimit: entity.clickLimit,
      clickCount: entity.clickCount,
      lastClickedAt: entity.lastClickedAt,
      metadata: entity.metadata,
    });
  }

  toEntity(): ShortLink {
    throw new ToDoException();
  }

  mapToPage(paginationEntity: Pagination<ShortLink>): PageDTO<ShortLinkDTO> {
    return new PageDTO<ShortLinkDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

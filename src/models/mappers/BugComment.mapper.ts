import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { BugCommentDTO } from 'models/dto/BugComment.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { BugComment } from 'models/entity/BugComment.entity';

@Injectable()
export class BugCommentMapper implements BaseMapper<BugComment, BugCommentDTO> {
  toDTO(entity: BugComment): BugCommentDTO {
    return new BugCommentDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      body: entity.body,
      authorId: entity.author?.id,
      authorName: entity.author?.name,
      parentId: entity.parent?.id,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntity(dto: BugCommentDTO): BugComment | Promise<BugComment> {
    throw new Error('Method not implemented.');
  }

  mapToPage(
    paginationEntity: Pagination<BugComment, IPaginationMeta>,
  ): PageDTO<BugCommentDTO> {
    return new PageDTO<BugCommentDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

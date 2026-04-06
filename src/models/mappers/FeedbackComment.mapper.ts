import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { FeedbackCommentDTO } from 'models/dto/FeedbackComment.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { FeedbackComment } from 'models/entity/FeedbackComment.entity';

@Injectable()
export class FeedbackCommentMapper
  implements BaseMapper<FeedbackComment, FeedbackCommentDTO>
{
  toDTO(entity: FeedbackComment): FeedbackCommentDTO {
    return new FeedbackCommentDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      body: entity.body,
      authorId: entity.author?.id,
      authorName: entity.author?.name,
      parentId: entity.parent?.id,
    });
  }

  toEntity(
    dto: FeedbackCommentDTO,
  ): FeedbackComment | Promise<FeedbackComment> {
    throw new Error('Method not implemented.');
  }

  mapToPage(
    paginationEntity: Pagination<FeedbackComment, IPaginationMeta>,
  ): PageDTO<FeedbackCommentDTO> {
    return new PageDTO<FeedbackCommentDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

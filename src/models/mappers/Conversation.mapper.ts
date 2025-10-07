import { ToDoException } from 'core/exceptions/ToDo.exception';
import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';

import { ConversationDTO } from 'models/dto/Conversation.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Conversation } from 'models/entity/Conversation.entity';

@Injectable()
export class ConversationMapper
  implements BaseMapper<Conversation, ConversationDTO>
{
  toDTO(entity: Conversation): ConversationDTO {
    return new ConversationDTO({
      id: entity.id,
      name: entity.name,
      projectId: entity.project?.id,
    });
  }

  toEntity(dto: ConversationDTO): Conversation {
    throw new ToDoException();
  }

  mapToPage(
    paginationEntity: Pagination<Conversation, IPaginationMeta>,
  ): PageDTO<ConversationDTO> {
    throw new ToDoException();
  }
}

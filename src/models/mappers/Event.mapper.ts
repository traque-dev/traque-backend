import { ToDoException } from 'core/exceptions/ToDo.exception';
import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { EventDto } from 'models/dto/Event.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Event } from 'models/entity/Event.entity';

import type { Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class EventMapper implements BaseMapper<Event, EventDto> {
  toDTO(entity: Event): EventDto {
    return new EventDto({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      properties: entity.properties,
      // personId: entity.person?.id,
    });
  }

  toEntity(): Event {
    throw new ToDoException();
  }

  mapToPage(paginationEntity: Pagination<Event>): PageDTO<EventDto> {
    return new PageDTO<EventDto>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';

import { EventNotificationTriggerDto } from 'models/dto/EventNotificationTrigger.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { EventNotificationTrigger } from 'models/entity/EventNotificationTrigger.entity';

import { ProjectMapper } from './Project.mapper';

@Injectable()
export class EventNotificationTriggerMapper
  implements BaseMapper<EventNotificationTrigger, EventNotificationTriggerDto>
{
  constructor(private readonly projectMapper: ProjectMapper) {}

  toDTO(entity: EventNotificationTrigger): EventNotificationTriggerDto {
    const dto = new EventNotificationTriggerDto({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      onEvent: entity.onEvent,
      mobilePush: entity.mobilePush,
      discord: entity.discord,
      email: entity.email,
    });

    if (entity.project) {
      dto.withProject(this.projectMapper.toDTO(entity.project));
    }

    return dto;
  }

  toEntity(dto: EventNotificationTriggerDto): EventNotificationTrigger {
    return new EventNotificationTrigger({
      onEvent: dto.onEvent,
      mobilePush: dto.mobilePush ?? false,
      discord: dto.discord ?? false,
      email: dto.email ?? false,
    });
  }

  mapToPage(
    paginationEntity: Pagination<EventNotificationTrigger>,
  ): PageDTO<EventNotificationTriggerDto> {
    return new PageDTO<EventNotificationTriggerDto>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

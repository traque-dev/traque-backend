import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { EventDto } from 'models/dto/Event.dto';
import { EventNotificationTriggerDto } from 'models/dto/EventNotificationTrigger.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Event } from 'models/entity/Event.entity';
import { EventNotificationTrigger } from 'models/entity/EventNotificationTrigger.entity';
// import { Person } from 'models/entity/Person.entity';
import { Project } from 'models/entity/Project.entity';
import { EventCapturedEvent } from 'models/events/EventCaptured.event';
import { EventMapper } from 'models/mappers/Event.mapper';
import { EventNotificationTriggerMapper } from 'models/mappers/EventNotificationTrigger.mapper';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventNotificationTrigger)
    private readonly eventNotificationTriggerRepository: Repository<EventNotificationTrigger>,
    private readonly eventEmitter: EventEmitter2,
    // @InjectRepository(Person)
    // private readonly personRepo: Repository<Person>,
    private readonly eventMapper: EventMapper,
    private readonly eventNotificationTriggerMapper: EventNotificationTriggerMapper,
  ) {}

  async captureEvent(project: Project, eventDto: EventDto): Promise<Event> {
    const event = new Event({
      project,
      name: eventDto.name,
      properties: eventDto.properties,
    });

    // if (eventDto.personId) {
    //   const person = await this.personRepo.findOne({
    //     where: {
    //       id: eventDto.personId,
    //       organization: {
    //         id: project?.organization?.id,
    //       },
    //     },
    //   });

    //   if (person) {
    //     event.setPerson(person);
    //   }
    // }

    const newEvent = await this.eventRepository.save(event);

    this.eventEmitter.emit(
      EventCapturedEvent.eventName,
      new EventCapturedEvent({
        event: newEvent,
      }),
    );

    return newEvent;
  }

  async paginateEvents(
    project: Project,
    { size, page, sort }: Pageable<Event>,
  ): Promise<PageDTO<EventDto>> {
    const events = await paginate(
      this.eventRepository,
      {
        page,
        limit: size,
      },
      {
        where: {
          project: {
            id: project.id,
          },
        },
        order: sort,
      },
    );

    return this.eventMapper.mapToPage(events);
  }

  async getEventNotificationTriggers(
    project: Project,
  ): Promise<EventNotificationTriggerDto[]> {
    const triggers = await this.eventNotificationTriggerRepository.find({
      where: {
        project: {
          id: project.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        project: true,
      },
    });

    return triggers.map((trigger) =>
      this.eventNotificationTriggerMapper.toDTO(trigger),
    );
  }

  async getEventNotificationTriggerById(
    project: Project,
    notificationTriggerId: string,
  ): Promise<EventNotificationTriggerDto> {
    const trigger = await this.eventNotificationTriggerRepository.findOne({
      where: {
        id: notificationTriggerId,
        project: {
          id: project.id,
        },
      },
      relations: {
        project: true,
      },
    });

    if (!trigger) {
      throw new NotFoundException({
        message: 'Event notification trigger not found',
      });
    }

    return this.eventNotificationTriggerMapper.toDTO(trigger);
  }

  async createEventNotificationTrigger(
    project: Project,
    notificationTriggerDto: EventNotificationTriggerDto,
  ): Promise<EventNotificationTriggerDto> {
    const trigger = this.eventNotificationTriggerMapper
      .toEntity(notificationTriggerDto)
      .forProject(project);

    const savedTrigger =
      await this.eventNotificationTriggerRepository.save(trigger);

    return this.eventNotificationTriggerMapper.toDTO(savedTrigger);
  }

  async updateEventNotificationTrigger(
    project: Project,
    notificationTriggerId: string,
    notificationTriggerDto: EventNotificationTriggerDto,
  ): Promise<EventNotificationTriggerDto> {
    const existingTrigger =
      await this.eventNotificationTriggerRepository.findOne({
        where: {
          id: notificationTriggerId,
          project: {
            id: project.id,
          },
        },
      });

    if (!existingTrigger) {
      throw new NotFoundException({
        message: 'Event notification trigger not found',
      });
    }

    const updatedTrigger = this.eventNotificationTriggerMapper
      .toEntity(notificationTriggerDto)
      .forProject(project)
      .withId(existingTrigger.id);

    const savedTrigger =
      await this.eventNotificationTriggerRepository.save(updatedTrigger);

    return this.eventNotificationTriggerMapper.toDTO(savedTrigger);
  }

  async deleteEventNotificationTrigger(
    project: Project,
    notificationTriggerId: string,
  ): Promise<void> {
    const trigger = await this.eventNotificationTriggerRepository.findOne({
      where: {
        id: notificationTriggerId,
        project: {
          id: project.id,
        },
      },
    });

    if (!trigger) {
      throw new NotFoundException({
        message: 'Event notification trigger not found',
      });
    }

    await this.eventNotificationTriggerRepository.remove(trigger);
  }
}

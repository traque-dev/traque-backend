import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpoPushMessage } from 'expo-server-sdk';
import { In, Repository } from 'typeorm';

import { Event } from 'models/entity/Event.entity';
import { EventNotificationTrigger } from 'models/entity/EventNotificationTrigger.entity';
import { Member } from 'models/entity/Member.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { EventCapturedEvent } from 'models/events/EventCaptured.event';
import { PushNotificationService } from 'services/PushNotification.service';

@Injectable()
export class EventListener {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Member)
    private readonly membersRepo: Repository<Member>,
    @InjectRepository(PushNotificationToken)
    private readonly pushTokenRepo: Repository<PushNotificationToken>,
    @InjectRepository(EventNotificationTrigger)
    private readonly eventNotificationTriggerRepo: Repository<EventNotificationTrigger>,
  ) {}

  @OnEvent(EventCapturedEvent.eventName)
  async handleEventCapturedEvent(payload: EventCapturedEvent) {
    const event = await this.eventRepo.findOne({
      where: {
        id: payload.event.id,
      },
      relations: {
        project: {
          organization: true,
        },
      },
    });

    if (!event) return;

    const notificationTrigger = await this.eventNotificationTriggerRepo.findOne(
      {
        where: {
          project: {
            id: event.project.id,
          },
          onEvent: event.name,
        },
      },
    );

    if (notificationTrigger) {
      const members = await this.membersRepo.find({
        where: {
          organization: {
            id: event.project.organization.id,
          },
        },
        relations: {
          user: true,
        },
      });

      if (notificationTrigger?.mobilePush) {
        const pushTokens = await this.pushTokenRepo.find({
          where: {
            session: {
              user: {
                id: In(members.map((m) => m.user.id)),
              },
            },
          },
        });

        const messages: ExpoPushMessage[] = [];

        for (const { expoPushToken } of pushTokens) {
          const pushMessage: ExpoPushMessage = {
            to: expoPushToken,
            title: `👀 New Event [${event.project.name}]`,
            subtitle: event.name,
            body: event.properties
              ? Object.entries(event.properties)
                  .map(([key, value]) => `${key} - ${value}`)
                  .join(', ')
              : undefined,
            sound: 'default',
          };

          messages.push(pushMessage);
        }

        await this.pushNotificationService.sendPushNotifications(messages);
      }
    }
  }
}

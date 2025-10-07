import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Exception } from 'models/entity/Exception.entity';
import { Member } from 'models/entity/Member.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { ExceptionCreatedEvent } from 'models/events/ExceptionCreated.event';
import { PushNotificationService } from 'services/PushNotification.service';

import type { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class ExceptionListener {
  constructor(
    @InjectRepository(Exception)
    private readonly exceptionRepo: Repository<Exception>,
    @InjectRepository(Member)
    private readonly membersRepo: Repository<Member>,
    @InjectRepository(PushNotificationToken)
    private readonly pushTokenRepo: Repository<PushNotificationToken>,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @OnEvent(ExceptionCreatedEvent.eventName)
  async onExceptionCreated(event: ExceptionCreatedEvent) {
    const exception = await this.exceptionRepo.findOne({
      where: {
        id: event.exception.id,
      },
      relations: {
        project: {
          organization: true,
        },
      },
    });

    if (!exception) return;

    const members = await this.membersRepo.find({
      where: {
        organization: {
          id: exception.project.organization.id,
        },
      },
      relations: {
        user: true,
      },
    });

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
        title: `⚠️ New Exception [${exception.project.name}]`,
        subtitle: exception.name,
        body: exception.message,
        data: {
          exceptionId: exception.id,
        },
        sound: 'default',
      };

      messages.push(pushMessage);
    }

    await this.pushNotificationService.sendPushNotifications(messages);
  }
}

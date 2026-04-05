import { resend } from 'core/email/sender';

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Bug } from 'models/entity/Bug.entity';
import { Member } from 'models/entity/Member.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { BugCreatedEvent } from 'models/events/BugCreated.event';
import { PushNotificationService } from 'services/PushNotification.service';

import type { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class BugListener {
  private readonly logger = new Logger(BugListener.name);

  constructor(
    @InjectRepository(Bug)
    private readonly bugRepository: Repository<Bug>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PushNotificationToken)
    private readonly pushTokenRepository: Repository<PushNotificationToken>,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @OnEvent(BugCreatedEvent.eventName)
  async onBugCreated(event: BugCreatedEvent): Promise<void> {
    const bug = await this.bugRepository.findOne({
      where: { id: event.bug.id },
      relations: {
        project: {
          organization: true,
        },
      },
    });

    if (!bug) return;

    const members = await this.memberRepository.find({
      where: { organization: { id: bug.project.organization.id } },
      relations: { user: true },
    });

    await Promise.all([
      this.sendPushNotifications(bug, members),
      this.sendEmails(bug, members),
    ]);
  }

  private async sendPushNotifications(
    bug: Bug,
    members: Member[],
  ): Promise<void> {
    const pushTokens = await this.pushTokenRepository.find({
      where: {
        session: {
          user: {
            id: In(members.map((m) => m.user.id)),
          },
        },
      },
    });

    const messages: ExpoPushMessage[] = pushTokens.map(({ expoPushToken }) => ({
      to: expoPushToken,
      title: `🐛 New Bug [${bug.project.name}]`,
      body: bug.title,
      data: { bugId: bug.id },
      sound: 'default' as const,
    }));

    if (messages.length > 0) {
      await this.pushNotificationService.sendPushNotifications(messages);
    }
  }

  private async sendEmails(bug: Bug, members: Member[]): Promise<void> {
    for (const member of members) {
      try {
        await resend.emails.send({
          from: 'Traque Bugs <no-reply@traque.dev>',
          to: member.user.email,
          subject: `New bug reported: ${bug.title}`,
          html: `
            <h2>A new bug has been reported in ${bug.project.name}</h2>
            <p><strong>Title:</strong> ${bug.title}</p>
            ${bug.description ? `<p><strong>Description:</strong> ${bug.description}</p>` : ''}
            <p><strong>Priority:</strong> ${bug.priority}</p>
            <p><strong>Status:</strong> ${bug.status}</p>
            ${bug.environment ? `<p><strong>Environment:</strong> ${bug.environment}</p>` : ''}
          `,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send bug email to ${member.user.email}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}

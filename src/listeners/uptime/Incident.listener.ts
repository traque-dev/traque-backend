import { resend } from 'core/email/sender';

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Member } from 'models/entity/Member.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { Incident } from 'models/entity/uptime/Incident.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { IncidentCreatedEvent } from 'models/events/IncidentCreated.event';
import { IncidentResolvedEvent } from 'models/events/IncidentResolved.event';
import {
  EscalationPolicy,
  ESCALATION_DELAY_MS,
} from 'models/types/uptime/EscalationPolicy';
import { IncidentStatus } from 'models/types/uptime/IncidentStatus';
import { IncidentTimelineEntryType } from 'models/types/uptime/IncidentTimelineEntryType';
import { NotificationChannel } from 'models/types/uptime/NotificationChannel';
import { PushNotificationService } from 'services/PushNotification.service';
import { IncidentService } from 'services/uptime/Incident.service';

import type { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class IncidentListener {
  private readonly logger = new Logger(IncidentListener.name);

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PushNotificationToken)
    private readonly pushTokenRepository: Repository<PushNotificationToken>,
    private readonly incidentService: IncidentService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @OnEvent(IncidentCreatedEvent.eventName)
  async onIncidentCreated(event: IncidentCreatedEvent): Promise<void> {
    const incident = await this.incidentRepository.findOne({
      where: { id: event.incident.id },
      relations: { monitor: { organization: true } },
    });

    if (!incident) return;

    const monitor = incident.monitor;
    const members = await this.getOrgMembers(monitor.organization.id);

    await this.sendNotifications(incident, monitor, members);

    if (monitor.escalationPolicy !== EscalationPolicy.DO_NOTHING) {
      const delayMs = ESCALATION_DELAY_MS[monitor.escalationPolicy];

      if (delayMs > 0) {
        setTimeout(() => {
          void this.escalateIfNotAcknowledged(incident.id, monitor, members);
        }, delayMs);
      } else {
        await this.escalateToAllMembers(incident, monitor, members);
      }
    }
  }

  @OnEvent(IncidentResolvedEvent.eventName)
  async onIncidentResolved(event: IncidentResolvedEvent): Promise<void> {
    const incident = await this.incidentRepository.findOne({
      where: { id: event.incident.id },
      relations: { monitor: { organization: true } },
    });

    if (!incident) return;

    const monitor = incident.monitor;
    const members = await this.getOrgMembers(monitor.organization.id);

    await this.sendResolvedNotifications(incident, monitor, members);
  }

  private async sendNotifications(
    incident: Incident,
    monitor: Monitor,
    members: Member[],
  ): Promise<void> {
    const channels = monitor.notificationChannels;

    if (channels.includes(NotificationChannel.EMAIL)) {
      for (const member of members) {
        try {
          await resend.emails.send({
            from: 'Traque Uptime <no-reply@traque.dev>',
            to: member.user.email,
            subject: `Incident: ${monitor.name} is down`,
            html: `
              <h2>${monitor.name} is down</h2>
              <p><strong>Cause:</strong> ${incident.cause}</p>
              <p><strong>URL:</strong> ${incident.checkedUrl}</p>
              <p><strong>Started at:</strong> ${incident.startedAt.toISOString()}</p>
            `,
          });

          await this.incidentService.addTimelineEntry(incident, {
            type: IncidentTimelineEntryType.NOTIFICATION_SENT,
            message: `Sent an email to ${member.user.name} at ${member.user.email}.`,
            metadata: {
              channel: NotificationChannel.EMAIL,
              userId: member.user.id,
              email: member.user.email,
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to send incident email to ${member.user.email}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    if (channels.includes(NotificationChannel.PUSH)) {
      await this.sendPushNotifications(incident, monitor, members);
    }
  }

  private async sendResolvedNotifications(
    incident: Incident,
    monitor: Monitor,
    members: Member[],
  ): Promise<void> {
    const channels = monitor.notificationChannels;

    if (channels.includes(NotificationChannel.EMAIL)) {
      for (const member of members) {
        try {
          await resend.emails.send({
            from: 'Traque Uptime <no-reply@traque.dev>',
            to: member.user.email,
            subject: `Resolved: ${monitor.name} is back up`,
            html: `
              <h2>${monitor.name} is back up</h2>
              <p>The incident has been ${incident.resolvedAutomatically ? 'automatically resolved' : 'resolved'}.</p>
              <p><strong>Duration:</strong> ${this.formatDuration(incident.startedAt, incident.resolvedAt!)}</p>
            `,
          });
        } catch (error) {
          this.logger.error(
            `Failed to send resolved email to ${member.user.email}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    if (channels.includes(NotificationChannel.PUSH)) {
      const pushTokens = await this.getPushTokens(members);
      const messages: ExpoPushMessage[] = pushTokens.map(
        ({ expoPushToken }) => ({
          to: expoPushToken,
          title: `Resolved: ${monitor.name}`,
          body: `${monitor.name} is back up.`,
          data: { incidentId: incident.id },
          sound: 'default' as const,
        }),
      );

      if (messages.length > 0) {
        await this.pushNotificationService.sendPushNotifications(messages);
      }
    }
  }

  private async sendPushNotifications(
    incident: Incident,
    monitor: Monitor,
    members: Member[],
  ): Promise<void> {
    const pushTokens = await this.getPushTokens(members);
    const messages: ExpoPushMessage[] = pushTokens.map(({ expoPushToken }) => ({
      to: expoPushToken,
      title: `Incident: ${monitor.name} is down`,
      body: incident.cause,
      data: { incidentId: incident.id },
      sound: 'default' as const,
    }));

    if (messages.length > 0) {
      await this.pushNotificationService.sendPushNotifications(messages);
    }
  }

  private async escalateIfNotAcknowledged(
    incidentId: string,
    monitor: Monitor,
    members: Member[],
  ): Promise<void> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) return;

    if (incident.status === IncidentStatus.STARTED) {
      await this.escalateToAllMembers(incident, monitor, members);
    }
  }

  private async escalateToAllMembers(
    incident: Incident,
    monitor: Monitor,
    members: Member[],
  ): Promise<void> {
    const channels = monitor.notificationChannels;

    if (channels.includes(NotificationChannel.EMAIL)) {
      for (const member of members) {
        try {
          await resend.emails.send({
            from: 'Traque Uptime <no-reply@traque.dev>',
            to: member.user.email,
            subject: `ESCALATION: ${monitor.name} is still down`,
            html: `
              <h2>${monitor.name} is still down (escalation)</h2>
              <p>The on-call person did not acknowledge the incident.</p>
              <p><strong>Cause:</strong> ${incident.cause}</p>
              <p><strong>URL:</strong> ${incident.checkedUrl}</p>
              <p><strong>Started at:</strong> ${incident.startedAt.toISOString()}</p>
            `,
          });

          await this.incidentService.addTimelineEntry(incident, {
            type: IncidentTimelineEntryType.NOTIFICATION_SENT,
            message: `Escalation: sent an email to ${member.user.name} at ${member.user.email}.`,
            metadata: {
              channel: NotificationChannel.EMAIL,
              userId: member.user.id,
              email: member.user.email,
              escalation: true,
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to send escalation email to ${member.user.email}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }
  }

  private async getOrgMembers(organizationId: string): Promise<Member[]> {
    return this.memberRepository.find({
      where: { organization: { id: organizationId } },
      relations: { user: true },
    });
  }

  private async getPushTokens(
    members: Member[],
  ): Promise<PushNotificationToken[]> {
    return this.pushTokenRepository.find({
      where: {
        session: {
          user: {
            id: In(members.map((m) => m.user.id)),
          },
        },
      },
    });
  }

  private formatDuration(start: Date, end: Date): string {
    const ms = end.getTime() - start.getTime();
    const minutes = Math.round(ms / 60_000);

    if (minutes < 60) return `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours} hours and ${remainingMinutes} minutes`;
  }
}

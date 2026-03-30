import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { In, Repository } from 'typeorm';

import { IncidentFilters } from 'models/dto/uptime/IncidentFilters.dto';
import { Organization } from 'models/entity/Organization.entity';
import { Incident } from 'models/entity/uptime/Incident.entity';
import { IncidentTimelineEntry } from 'models/entity/uptime/IncidentTimelineEntry.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
import { User } from 'models/entity/User.entity';
import { IncidentCreatedEvent } from 'models/events/IncidentCreated.event';
import { IncidentResolvedEvent } from 'models/events/IncidentResolved.event';
import { IncidentStatus } from 'models/types/uptime/IncidentStatus';
import { IncidentTimelineEntryType } from 'models/types/uptime/IncidentTimelineEntryType';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(IncidentTimelineEntry)
    private readonly timelineRepository: Repository<IncidentTimelineEntry>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOpenIncident(monitorId: string): Promise<Incident | null> {
    return this.incidentRepository.findOne({
      where: {
        monitor: { id: monitorId },
        status: In([IncidentStatus.STARTED, IncidentStatus.ACKNOWLEDGED]),
      },
      relations: { monitor: true },
    });
  }

  async openIncident(monitor: Monitor, check: MonitorCheck): Promise<Incident> {
    const checkedUrl = `${monitor.httpMethod} ${monitor.url}`;

    const incident = new Incident({
      status: IncidentStatus.STARTED,
      cause: check.errorMessage ?? 'Monitor check failed',
      checkedUrl,
      startedAt: check.checkedAt,
      resolvedAutomatically: false,
    });

    incident.monitor = monitor;
    incident.organization = monitor.organization;

    const saved = await this.incidentRepository.save(incident);

    await this.addTimelineEntry(saved, {
      type: IncidentTimelineEntryType.CHECK_FAILED,
      message: this.buildCheckFailedMessage(monitor, check),
      region: check.region,
      metadata: {
        httpStatusCode: check.httpStatusCode,
        errorMessage: check.errorMessage,
        totalResponseMs: check.totalResponseMs,
      },
    });

    await this.addTimelineEntry(saved, {
      type: IncidentTimelineEntryType.INCIDENT_STARTED,
      message: 'Incident started.',
    });

    this.eventEmitter.emit(
      IncidentCreatedEvent.eventName,
      new IncidentCreatedEvent({ incident: saved }),
    );

    this.logger.log(`Opened incident ${saved.id} for monitor ${monitor.id}`);

    return saved;
  }

  async addCheckFailedEntry(
    incident: Incident,
    monitor: Monitor,
    check: MonitorCheck,
  ): Promise<void> {
    await this.addTimelineEntry(incident, {
      type: IncidentTimelineEntryType.CHECK_FAILED,
      message: this.buildCheckFailedMessage(monitor, check),
      region: check.region,
      metadata: {
        httpStatusCode: check.httpStatusCode,
        errorMessage: check.errorMessage,
        totalResponseMs: check.totalResponseMs,
      },
    });
  }

  async addMonitorRecoveredEntry(
    incident: Incident,
    region?: MonitorRegion,
  ): Promise<void> {
    await this.addTimelineEntry(incident, {
      type: IncidentTimelineEntryType.MONITOR_RECOVERED,
      message: 'Monitor recovered.',
      region,
    });
  }

  async addWaitingForRecoveryEntry(
    incident: Incident,
    recoveryPeriodSeconds: number,
  ): Promise<void> {
    const minutes = Math.round(recoveryPeriodSeconds / 60);

    await this.addTimelineEntry(incident, {
      type: IncidentTimelineEntryType.WAITING_FOR_RECOVERY,
      message: `Waiting for ${minutes} minutes before auto-resolving the incident, and postponing all escalations.`,
    });
  }

  async autoResolveIncident(incident: Incident): Promise<void> {
    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.resolvedAutomatically = true;

    await this.incidentRepository.save(incident);

    await this.addTimelineEntry(incident, {
      type: IncidentTimelineEntryType.INCIDENT_RESOLVED,
      message: 'Incident resolved automatically.',
    });

    this.eventEmitter.emit(
      IncidentResolvedEvent.eventName,
      new IncidentResolvedEvent({ incident }),
    );

    this.logger.log(`Auto-resolved incident ${incident.id}`);
  }

  async getIncidents(
    organization: Organization,
    pageable: Pageable<Incident>,
    filters: IncidentFilters,
  ): Promise<Pagination<Incident>> {
    const where: Record<string, any> = {
      organization: { id: organization.id },
    };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.monitorId) {
      where.monitor = { id: filters.monitorId };
    }

    return paginate<Incident>(
      this.incidentRepository,
      { page: pageable.page, limit: pageable.size },
      {
        where,
        order: pageable.sort ?? { startedAt: 'DESC' },
        relations: { monitor: true },
      },
    );
  }

  async getIncidentById(
    organization: Organization,
    incidentId: string,
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId, organization: { id: organization.id } },
      relations: { monitor: true, acknowledgedBy: true },
    });

    if (!incident) {
      throw new NotFoundException({ message: 'Incident not found' });
    }

    return incident;
  }

  async getTimeline(
    incidentId: string,
    pageable: Pageable<IncidentTimelineEntry>,
  ): Promise<Pagination<IncidentTimelineEntry>> {
    return paginate<IncidentTimelineEntry>(
      this.timelineRepository,
      { page: pageable.page, limit: pageable.size },
      {
        where: { incident: { id: incidentId } },
        order: pageable.sort ?? { createdAt: 'ASC' },
      },
    );
  }

  async acknowledgeIncident(
    organization: Organization,
    incidentId: string,
    user: User,
  ): Promise<Incident> {
    const incident = await this.getIncidentById(organization, incidentId);

    incident.status = IncidentStatus.ACKNOWLEDGED;
    incident.acknowledgedAt = new Date();
    incident.acknowledgedBy = user;

    const saved = await this.incidentRepository.save(incident);

    await this.addTimelineEntry(saved, {
      type: IncidentTimelineEntryType.INCIDENT_ACKNOWLEDGED,
      message: `${user.name} acknowledged the incident.`,
      metadata: { userId: user.id, userName: user.name },
    });

    return saved;
  }

  async resolveIncident(
    organization: Organization,
    incidentId: string,
    user: User,
  ): Promise<Incident> {
    const incident = await this.getIncidentById(organization, incidentId);

    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.resolvedAutomatically = false;

    const saved = await this.incidentRepository.save(incident);

    await this.addTimelineEntry(saved, {
      type: IncidentTimelineEntryType.INCIDENT_RESOLVED,
      message: `${user.name} resolved the incident.`,
      metadata: { userId: user.id, userName: user.name },
    });

    this.eventEmitter.emit(
      IncidentResolvedEvent.eventName,
      new IncidentResolvedEvent({ incident: saved }),
    );

    return saved;
  }

  async addComment(
    organization: Organization,
    incidentId: string,
    user: User,
    body: string,
  ): Promise<IncidentTimelineEntry> {
    const incident = await this.getIncidentById(organization, incidentId);

    return this.addTimelineEntry(incident, {
      type: IncidentTimelineEntryType.COMMENT,
      message: body,
      metadata: { userId: user.id, userName: user.name },
    });
  }

  async addTimelineEntry(
    incident: Incident,
    data: {
      type: IncidentTimelineEntryType;
      message: string;
      region?: MonitorRegion;
      metadata?: Record<string, any>;
    },
  ): Promise<IncidentTimelineEntry> {
    const entry = new IncidentTimelineEntry({
      type: data.type,
      message: data.message,
      region: data.region,
      metadata: data.metadata,
    });

    entry.incident = incident;

    return this.timelineRepository.save(entry);
  }

  private buildCheckFailedMessage(
    monitor: Monitor,
    check: MonitorCheck,
  ): string {
    const error = check.errorMessage ?? 'unknown error';

    return `Received a ${error} at ${monitor.url} when checked from ${check.region ?? 'unknown region'}.`;
  }
}

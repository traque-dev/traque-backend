import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import {
  UPTIME_MONITOR_CHECK_JOB,
  UPTIME_MONITOR_CHECK_QUEUE,
} from 'queues/uptime/UptimeQueue.constants';
import { ILike, Repository } from 'typeorm';

import { PageDTO } from 'models/dto/Page.dto';
import { CreateMonitorDTO } from 'models/dto/uptime/CreateMonitor.dto';
import { MonitorDTO } from 'models/dto/uptime/Monitor.dto';
import { MonitorFilters } from 'models/dto/uptime/MonitorFilters.dto';
import { UpdateMonitorDTO } from 'models/dto/uptime/UpdateMonitor.dto';
import { Organization } from 'models/entity/Organization.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { EscalationPolicy } from 'models/types/uptime/EscalationPolicy';
import { HttpMethod } from 'models/types/uptime/HttpMethod';
import { IpVersion } from 'models/types/uptime/IpVersion';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';
import { MonitorStatus } from 'models/types/uptime/MonitorStatus';
import { NotificationChannel } from 'models/types/uptime/NotificationChannel';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    @InjectQueue(UPTIME_MONITOR_CHECK_QUEUE)
    private readonly checkQueue: Queue,
  ) {}

  async getMonitors(
    organization: Organization,
    pageable: Pageable<Monitor>,
    filters: MonitorFilters,
  ): Promise<PageDTO<MonitorDTO>> {
    const where: Record<string, any> = {
      organization: { id: organization.id },
    };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.search) {
      where.name = ILike(`%${filters.search}%`);
    }

    const page = await paginate<Monitor>(
      this.monitorRepository,
      {
        page: pageable.page,
        limit: pageable.size,
      },
      {
        where,
        order: pageable.sort,
      },
    );

    return new PageDTO<MonitorDTO>(
      page.items.map((m) => new MonitorDTO(m)),
      page.meta,
    );
  }

  async getMonitorById(
    organization: Organization,
    monitorId: string,
  ): Promise<MonitorDTO> {
    const monitor = await this.findMonitorEntity(organization, monitorId);

    return new MonitorDTO(monitor);
  }

  async findMonitorEntity(
    organization: Organization,
    monitorId: string,
  ): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOne({
      where: { id: monitorId, organization: { id: organization.id } },
    });

    if (!monitor) {
      throw new NotFoundException({ message: 'Monitor not found' });
    }

    return monitor;
  }

  async createMonitor(
    organization: Organization,
    dto: CreateMonitorDTO,
  ): Promise<MonitorDTO> {
    const monitor = new Monitor({
      name: dto.name,
      pronounceableName: dto.pronounceableName,
      url: dto.url,
      type: dto.type,
      status: MonitorStatus.PENDING,
      checkIntervalSeconds: dto.checkIntervalSeconds ?? 180,
      confirmationPeriodSeconds: dto.confirmationPeriodSeconds ?? 0,
      recoveryPeriodSeconds: dto.recoveryPeriodSeconds ?? 180,
      requestTimeoutSeconds: dto.requestTimeoutSeconds ?? 30,
      httpMethod: dto.httpMethod ?? HttpMethod.GET,
      requestBody: dto.requestBody,
      requestHeaders: dto.requestHeaders,
      followRedirects: dto.followRedirects ?? true,
      keepCookiesOnRedirect: dto.keepCookiesOnRedirect ?? true,
      basicAuthUsername: dto.basicAuthUsername,
      basicAuthPassword: dto.basicAuthPassword,
      proxyHost: dto.proxyHost,
      proxyPort: dto.proxyPort,
      keyword: dto.keyword,
      expectedStatusCode: dto.expectedStatusCode,
      port: dto.port,
      ipVersion: dto.ipVersion ?? IpVersion.BOTH,
      regions: dto.regions ?? [
        MonitorRegion.EUROPE,
        MonitorRegion.NORTH_AMERICA,
        MonitorRegion.ASIA,
        MonitorRegion.AUSTRALIA,
      ],
      sslVerification: dto.sslVerification ?? true,
      sslExpirationAlertDays: dto.sslExpirationAlertDays,
      domainExpirationAlertDays: dto.domainExpirationAlertDays,
      maintenanceWindowStartTime: dto.maintenanceWindowStartTime,
      maintenanceWindowEndTime: dto.maintenanceWindowEndTime,
      maintenanceWindowTimezone: dto.maintenanceWindowTimezone,
      maintenanceWindowDays: dto.maintenanceWindowDays,
      notificationChannels: dto.notificationChannels ?? [
        NotificationChannel.EMAIL,
      ],
      escalationPolicy: dto.escalationPolicy ?? EscalationPolicy.IMMEDIATELY,
    });

    monitor.organization = organization;

    const saved = await this.monitorRepository.save(monitor);

    await this.scheduleCheckJob(saved);

    this.logger.log(`Created monitor ${saved.id} for org ${organization.id}`);

    return new MonitorDTO(saved);
  }

  async updateMonitor(
    organization: Organization,
    monitorId: string,
    dto: UpdateMonitorDTO,
  ): Promise<MonitorDTO> {
    const monitor = await this.findMonitorEntity(organization, monitorId);

    const intervalChanged =
      dto.checkIntervalSeconds !== undefined &&
      dto.checkIntervalSeconds !== monitor.checkIntervalSeconds;

    Object.assign(monitor, dto);

    const saved = await this.monitorRepository.save(monitor);

    if (intervalChanged && saved.status !== MonitorStatus.PAUSED) {
      await this.removeCheckJob(saved.id);
      await this.scheduleCheckJob(saved);
    }

    return new MonitorDTO(saved);
  }

  async deleteMonitor(
    organization: Organization,
    monitorId: string,
  ): Promise<void> {
    const monitor = await this.findMonitorEntity(organization, monitorId);

    await this.removeCheckJob(monitor.id);
    await this.monitorRepository.remove(monitor);

    this.logger.log(`Deleted monitor ${monitorId}`);
  }

  async pauseMonitor(
    organization: Organization,
    monitorId: string,
  ): Promise<MonitorDTO> {
    const monitor = await this.findMonitorEntity(organization, monitorId);

    monitor.status = MonitorStatus.PAUSED;
    const saved = await this.monitorRepository.save(monitor);

    await this.removeCheckJob(monitor.id);

    this.logger.log(`Paused monitor ${monitorId}`);

    return new MonitorDTO(saved);
  }

  async resumeMonitor(
    organization: Organization,
    monitorId: string,
  ): Promise<MonitorDTO> {
    const monitor = await this.findMonitorEntity(organization, monitorId);

    monitor.status = MonitorStatus.PENDING;
    const saved = await this.monitorRepository.save(monitor);

    await this.scheduleCheckJob(saved);

    this.logger.log(`Resumed monitor ${monitorId}`);

    return new MonitorDTO(saved);
  }

  private async scheduleCheckJob(monitor: Monitor): Promise<void> {
    await this.checkQueue.add(
      UPTIME_MONITOR_CHECK_JOB,
      { monitorId: monitor.id },
      {
        repeat: {
          every: monitor.checkIntervalSeconds * 1000,
        },
        jobId: `monitor-${monitor.id}`,
      },
    );
  }

  private async removeCheckJob(monitorId: string): Promise<void> {
    const repeatableJobs = await this.checkQueue.getRepeatableJobs();
    const job = repeatableJobs.find((j) => j.id === `monitor-${monitorId}`);

    if (job) {
      await this.checkQueue.removeRepeatableByKey(job.key);
    }
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
import { CheckStatus } from 'models/types/uptime/CheckStatus';
import { MaintenanceDay } from 'models/types/uptime/MaintenanceDay';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';
import { MonitorStatus } from 'models/types/uptime/MonitorStatus';
import { IncidentService } from 'services/uptime/Incident.service';
import { MonitorCheckEngine } from 'services/uptime/MonitorCheckEngine.service';

import {
  UPTIME_MONITOR_CHECK_JOB,
  UPTIME_MONITOR_CHECK_QUEUE,
} from './UptimeQueue.constants';
import type { MonitorCheckJobData } from './UptimeQueue.types';

@Processor(UPTIME_MONITOR_CHECK_QUEUE)
export class MonitorCheckProcessor extends WorkerHost {
  private readonly logger = new Logger(MonitorCheckProcessor.name);

  constructor(
    private readonly checkEngine: MonitorCheckEngine,
    private readonly incidentService: IncidentService,
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    @InjectRepository(MonitorCheck)
    private readonly checkRepository: Repository<MonitorCheck>,
  ) {
    super();
  }

  async process(job: Job<MonitorCheckJobData>): Promise<void> {
    if (job.name !== UPTIME_MONITOR_CHECK_JOB) {
      return;
    }

    const { monitorId } = job.data;

    const monitor = await this.monitorRepository.findOne({
      where: { id: monitorId },
      relations: { organization: true },
    });

    if (!monitor) {
      this.logger.warn(`Monitor ${monitorId} not found, skipping check`);
      return;
    }

    if (monitor.status === MonitorStatus.PAUSED) {
      return;
    }

    if (this.isInMaintenanceWindow(monitor)) {
      this.logger.debug(
        `Monitor ${monitorId} is in maintenance window, skipping check`,
      );
      return;
    }

    const previousStatus = monitor.status;
    const region = this.pickRegion(monitor.regions);
    const result = await this.checkEngine.performCheck(monitor);

    const check = new MonitorCheck({
      status: result.status,
      region,
      checkedAt: new Date(),
      httpStatusCode: result.httpStatusCode,
      errorMessage: result.errorMessage,
      dnsLookupMs: result.dnsLookupMs,
      tcpConnectionMs: result.tcpConnectionMs,
      tlsHandshakeMs: result.tlsHandshakeMs,
      firstByteMs: result.firstByteMs,
      totalResponseMs: result.totalResponseMs,
    });

    check.monitor = monitor;
    await this.checkRepository.save(check);

    const newStatus =
      result.status === CheckStatus.UP ? MonitorStatus.UP : MonitorStatus.DOWN;

    await this.monitorRepository.update(monitor.id, {
      status: newStatus,
      lastCheckedAt: check.checkedAt,
    });

    await this.handleIncidentLogic(monitor, check, previousStatus, newStatus);

    this.logger.debug(
      `Monitor ${monitorId} check complete: ${result.status} (${result.totalResponseMs ?? '?'}ms)`,
    );
  }

  private async handleIncidentLogic(
    monitor: Monitor,
    check: MonitorCheck,
    previousStatus: MonitorStatus,
    newStatus: MonitorStatus,
  ): Promise<void> {
    const openIncident = await this.incidentService.findOpenIncident(
      monitor.id,
    );

    if (newStatus === MonitorStatus.DOWN) {
      if (!openIncident) {
        await this.incidentService.openIncident(monitor, check);
      } else {
        await this.incidentService.addCheckFailedEntry(
          openIncident,
          monitor,
          check,
        );
      }
    } else if (newStatus === MonitorStatus.UP && openIncident) {
      await this.incidentService.addMonitorRecoveredEntry(
        openIncident,
        check.region,
      );

      if (monitor.recoveryPeriodSeconds === 0) {
        await this.incidentService.autoResolveIncident(openIncident);
      } else if (previousStatus === MonitorStatus.DOWN) {
        await this.incidentService.addWaitingForRecoveryEntry(
          openIncident,
          monitor.recoveryPeriodSeconds,
        );
      } else {
        const lastDownCheck = await this.checkRepository.findOne({
          where: {
            monitor: { id: monitor.id },
            status: CheckStatus.DOWN,
          },
          order: { checkedAt: 'DESC' },
        });

        if (lastDownCheck) {
          const elapsedMs =
            check.checkedAt.getTime() - lastDownCheck.checkedAt.getTime();

          if (elapsedMs >= monitor.recoveryPeriodSeconds * 1000) {
            await this.incidentService.autoResolveIncident(openIncident);
          }
        }
      }
    }
  }

  private pickRegion(regions: MonitorRegion[]): MonitorRegion {
    if (!regions || regions.length === 0) {
      return MonitorRegion.EUROPE;
    }

    return regions[Math.floor(Math.random() * regions.length)];
  }

  private isInMaintenanceWindow(monitor: Monitor): boolean {
    if (
      !monitor.maintenanceWindowStartTime ||
      !monitor.maintenanceWindowEndTime ||
      !monitor.maintenanceWindowTimezone ||
      !monitor.maintenanceWindowDays?.length
    ) {
      return false;
    }

    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: monitor.maintenanceWindowTimezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const weekday = parts
      .find((p) => p.type === 'weekday')
      ?.value?.toUpperCase()
      ?.slice(0, 3);
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
    const currentTime = `${hour}:${minute}`;

    if (
      !weekday ||
      !monitor.maintenanceWindowDays.includes(weekday as MaintenanceDay)
    ) {
      return false;
    }

    const start = monitor.maintenanceWindowStartTime;
    const end = monitor.maintenanceWindowEndTime;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    }

    return currentTime >= start || currentTime <= end;
  }
}

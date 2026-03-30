import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
import { CheckStatus } from 'models/types/uptime/CheckStatus';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';

export interface MonitorSummary {
  currentlyUpForMs: number | null;
  lastCheckedAt: Date | null;
}

export interface ResponseTimePoint {
  checkedAt: Date;
  dnsLookupMs: number | null;
  tcpConnectionMs: number | null;
  tlsHandshakeMs: number | null;
  totalResponseMs: number | null;
}

export interface AvailabilityPeriod {
  label: string;
  from: Date;
  to: Date;
  availabilityPercent: number;
  downtimeMs: number;
  incidentCount: number;
  longestDowntimeMs: number;
  averageDowntimeMs: number;
}

@Injectable()
export class MonitorCheckService {
  constructor(
    @InjectRepository(MonitorCheck)
    private readonly checkRepository: Repository<MonitorCheck>,
  ) {}

  async getChecks(
    monitorId: string,
    pageable: Pageable<MonitorCheck>,
  ): Promise<Pagination<MonitorCheck>> {
    return paginate<MonitorCheck>(
      this.checkRepository,
      {
        page: pageable.page,
        limit: pageable.size,
      },
      {
        where: { monitor: { id: monitorId } },
        order: pageable.sort ?? { checkedAt: 'DESC' },
      },
    );
  }

  async getSummary(monitorId: string): Promise<MonitorSummary> {
    const lastCheck = await this.checkRepository.findOne({
      where: { monitor: { id: monitorId } },
      order: { checkedAt: 'DESC' },
    });

    if (!lastCheck) {
      return { currentlyUpForMs: null, lastCheckedAt: null };
    }

    const lastDownCheck = await this.checkRepository.findOne({
      where: {
        monitor: { id: monitorId },
        status: CheckStatus.DOWN,
      },
      order: { checkedAt: 'DESC' },
    });

    let currentlyUpForMs: number | null = null;

    if (!lastDownCheck) {
      const firstCheck = await this.checkRepository.findOne({
        where: { monitor: { id: monitorId } },
        order: { checkedAt: 'ASC' },
      });

      if (firstCheck) {
        currentlyUpForMs =
          lastCheck.checkedAt.getTime() - firstCheck.checkedAt.getTime();
      }
    } else if (lastCheck.status === CheckStatus.UP) {
      currentlyUpForMs =
        lastCheck.checkedAt.getTime() - lastDownCheck.checkedAt.getTime();
    }

    return {
      currentlyUpForMs,
      lastCheckedAt: lastCheck.checkedAt,
    };
  }

  async getResponseTimes(
    monitorId: string,
    region?: MonitorRegion,
    periodDays = 1,
  ): Promise<ResponseTimePoint[]> {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const qb = this.checkRepository
      .createQueryBuilder('check')
      .select([
        'check.checkedAt',
        'check.dnsLookupMs',
        'check.tcpConnectionMs',
        'check.tlsHandshakeMs',
        'check.totalResponseMs',
      ])
      .where('check.monitor_id = :monitorId', { monitorId })
      .andWhere('check.checked_at >= :since', { since })
      .orderBy('check.checked_at', 'ASC');

    if (region) {
      qb.andWhere('check.region = :region', { region });
    }

    const checks = await qb.getMany();

    return checks.map((c) => ({
      checkedAt: c.checkedAt,
      dnsLookupMs: c.dnsLookupMs ?? null,
      tcpConnectionMs: c.tcpConnectionMs ?? null,
      tlsHandshakeMs: c.tlsHandshakeMs ?? null,
      totalResponseMs: c.totalResponseMs ?? null,
    }));
  }

  async getAvailability(
    monitorId: string,
    from?: Date,
    to?: Date,
  ): Promise<AvailabilityPeriod[]> {
    const now = new Date();
    const resolvedTo = to ?? now;

    const periods = this.buildPeriods(resolvedTo, from);
    const result: AvailabilityPeriod[] = [];

    for (const period of periods) {
      const stats = await this.computeAvailabilityForPeriod(
        monitorId,
        period.from,
        period.to,
        period.label,
      );

      result.push(stats);
    }

    return result;
  }

  private buildPeriods(
    to: Date,
    from?: Date,
  ): { label: string; from: Date; to: Date }[] {
    if (from) {
      return [{ label: 'Custom', from, to }];
    }

    const todayStart = new Date(to);
    todayStart.setHours(0, 0, 0, 0);

    return [
      { label: 'Today', from: todayStart, to },
      {
        label: 'Last 7 days',
        from: new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000),
        to,
      },
      {
        label: 'Last 30 days',
        from: new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000),
        to,
      },
      {
        label: 'Last 365 days',
        from: new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000),
        to,
      },
    ];
  }

  private async computeAvailabilityForPeriod(
    monitorId: string,
    from: Date,
    to: Date,
    label: string,
  ): Promise<AvailabilityPeriod> {
    const checks = await this.checkRepository
      .createQueryBuilder('check')
      .select(['check.status', 'check.checkedAt'])
      .where('check.monitor_id = :monitorId', { monitorId })
      .andWhere('check.checked_at >= :from', { from })
      .andWhere('check.checked_at <= :to', { to })
      .orderBy('check.checked_at', 'ASC')
      .getMany();

    if (checks.length === 0) {
      return {
        label,
        from,
        to,
        availabilityPercent: 100,
        downtimeMs: 0,
        incidentCount: 0,
        longestDowntimeMs: 0,
        averageDowntimeMs: 0,
      };
    }

    let totalDowntimeMs = 0;
    let incidentCount = 0;
    let longestDowntimeMs = 0;
    let currentDowntimeStart: Date | null = null;
    const downtimeDurations: number[] = [];

    for (const check of checks) {
      if (check.status === CheckStatus.DOWN && currentDowntimeStart === null) {
        currentDowntimeStart = check.checkedAt;
        incidentCount++;
      } else if (
        check.status === CheckStatus.UP &&
        currentDowntimeStart !== null
      ) {
        const duration =
          check.checkedAt.getTime() - currentDowntimeStart.getTime();
        totalDowntimeMs += duration;
        downtimeDurations.push(duration);

        if (duration > longestDowntimeMs) {
          longestDowntimeMs = duration;
        }

        currentDowntimeStart = null;
      }
    }

    if (currentDowntimeStart !== null) {
      const duration = to.getTime() - currentDowntimeStart.getTime();
      totalDowntimeMs += duration;
      downtimeDurations.push(duration);

      if (duration > longestDowntimeMs) {
        longestDowntimeMs = duration;
      }
    }

    const totalPeriodMs = to.getTime() - from.getTime();
    const availabilityPercent =
      totalPeriodMs > 0
        ? Number(
            (((totalPeriodMs - totalDowntimeMs) / totalPeriodMs) * 100).toFixed(
              4,
            ),
          )
        : 100;

    const averageDowntimeMs =
      downtimeDurations.length > 0
        ? Math.round(
            downtimeDurations.reduce((a, b) => a + b, 0) /
              downtimeDurations.length,
          )
        : 0;

    return {
      label,
      from,
      to,
      availabilityPercent,
      downtimeMs: Math.round(totalDowntimeMs),
      incidentCount,
      longestDowntimeMs: Math.round(longestDowntimeMs),
      averageDowntimeMs,
    };
  }
}

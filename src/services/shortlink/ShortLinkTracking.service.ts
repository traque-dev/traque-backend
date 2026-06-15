import { Pageable } from 'core/interfaces/Pageable.interface';
import { parseUserAgent } from 'core/utils/parseUserAgent';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { PageDTO } from 'models/dto/Page.dto';
import { ShortLinkBreakdownItemDTO } from 'models/dto/shortlink/ShortLinkBreakdownItem.dto';
import { ShortLinkClickDTO } from 'models/dto/shortlink/ShortLinkClick.dto';
import { ShortLinkStatsDTO } from 'models/dto/shortlink/ShortLinkStats.dto';
import { ShortLinkTimePointDTO } from 'models/dto/shortlink/ShortLinkTimePoint.dto';
import { ShortLink } from 'models/entity/shortlink/ShortLink.entity';
import { ShortLinkClick } from 'models/entity/shortlink/ShortLinkClick.entity';
import { ShortLinkClickMapper } from 'models/mappers/shortlink/ShortLinkClick.mapper';
import { ClickBreakdownDimension } from 'models/types/shortlink/ClickBreakdownDimension';
import { ClickTimePeriod } from 'models/types/shortlink/ClickTimePeriod';
import { IpDetailsService } from 'services/IpDetails.service';

import type { ShortLinkClickJobData } from 'queues/shortlink/ShortLinkQueue.types';

const BREAKDOWN_COLUMNS: Record<ClickBreakdownDimension, string> = {
  [ClickBreakdownDimension.COUNTRY]: 'country',
  [ClickBreakdownDimension.REFERER]: 'referer_domain',
  [ClickBreakdownDimension.DEVICE]: 'device_type',
  [ClickBreakdownDimension.BROWSER]: 'browser',
  [ClickBreakdownDimension.OS]: 'os',
};

@Injectable()
export class ShortLinkTrackingService {
  private readonly logger = new Logger(ShortLinkTrackingService.name);

  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
    @InjectRepository(ShortLinkClick)
    private readonly clickRepository: Repository<ShortLinkClick>,
    private readonly clickMapper: ShortLinkClickMapper,
    private readonly ipDetailsService: IpDetailsService,
  ) {}

  async recordClick(data: ShortLinkClickJobData): Promise<void> {
    const shortLink = await this.shortLinkRepository.findOne({
      where: { id: data.shortLinkId },
    });

    if (!shortLink) {
      this.logger.warn(
        `Short link ${data.shortLinkId} not found, skipping click`,
      );
      return;
    }

    const ua = parseUserAgent(data.userAgent);
    const geo = await this.resolveGeo(data.ip);
    const clickedAt = data.clickedAt ? new Date(data.clickedAt) : new Date();

    const click = new ShortLinkClick({
      clickedAt,
      ipAddress: data.ip,
      country: geo?.country,
      region: geo?.region,
      city: geo?.city,
      userAgent: data.userAgent,
      deviceType: ua.deviceType,
      browser: ua.browser,
      os: ua.os,
      referer: data.referer,
      refererDomain: this.extractDomain(data.referer),
      language: this.normalizeLanguage(data.language),
      isBot: ua.isBot,
    });

    click.shortLink = shortLink;

    await this.clickRepository.save(click);

    await this.shortLinkRepository.increment(
      { id: shortLink.id },
      'clickCount',
      1,
    );
    await this.shortLinkRepository.update(
      { id: shortLink.id },
      { lastClickedAt: clickedAt },
    );
  }

  async getClicks(
    shortLinkId: string,
    pageable: Pageable<ShortLinkClick>,
  ): Promise<PageDTO<ShortLinkClickDTO>> {
    const page = await paginate<ShortLinkClick>(
      this.clickRepository,
      {
        page: pageable.page,
        limit: pageable.size,
      },
      {
        where: { shortLink: { id: shortLinkId } },
        order: pageable.sort ?? { clickedAt: 'DESC' },
      },
    );

    return this.clickMapper.mapToPage(page);
  }

  async getStats(shortLinkId: string): Promise<ShortLinkStatsDTO> {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const base = () =>
      this.clickRepository
        .createQueryBuilder('click')
        .where('click.short_link_id = :shortLinkId', { shortLinkId });

    const [
      totalClicks,
      uniqueVisitors,
      clicksToday,
      clicksLast7Days,
      clicksLast30Days,
      lastClick,
    ] = await Promise.all([
      base().getCount(),
      base()
        .select('COUNT(DISTINCT click.ip_address)', 'count')
        .getRawOne<{ count: string }>(),
      base()
        .andWhere('click.clicked_at >= :from', { from: startOfToday })
        .getCount(),
      base()
        .andWhere('click.clicked_at >= :from', { from: last7Days })
        .getCount(),
      base()
        .andWhere('click.clicked_at >= :from', { from: last30Days })
        .getCount(),
      base().orderBy('click.clicked_at', 'DESC').getOne(),
    ]);

    return new ShortLinkStatsDTO({
      totalClicks,
      uniqueVisitors: Number(uniqueVisitors?.count ?? 0),
      clicksToday,
      clicksLast7Days,
      clicksLast30Days,
      lastClickedAt: lastClick?.clickedAt ?? null,
    });
  }

  async getTimeSeries(
    shortLinkId: string,
    period: ClickTimePeriod = ClickTimePeriod.WEEK,
  ): Promise<ShortLinkTimePointDTO[]> {
    const granularity = period === ClickTimePeriod.DAY ? 'hour' : 'day';
    const since = this.periodStart(period);

    const rows = await this.clickRepository
      .createQueryBuilder('click')
      .select(`date_trunc('${granularity}', click.clicked_at)`, 'bucket')
      .addSelect('COUNT(*)', 'count')
      .where('click.short_link_id = :shortLinkId', { shortLinkId })
      .andWhere('click.clicked_at >= :since', { since })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany<{ bucket: Date; count: string }>();

    return rows.map(
      (row) =>
        new ShortLinkTimePointDTO({
          date: new Date(row.bucket).toISOString(),
          clicks: Number(row.count),
        }),
    );
  }

  async getBreakdown(
    shortLinkId: string,
    dimension: ClickBreakdownDimension,
    limit = 10,
  ): Promise<ShortLinkBreakdownItemDTO[]> {
    const column = BREAKDOWN_COLUMNS[dimension];

    const rows = await this.clickRepository
      .createQueryBuilder('click')
      .select(`click.${column}`, 'key')
      .addSelect('COUNT(*)', 'count')
      .where('click.short_link_id = :shortLinkId', { shortLinkId })
      .groupBy(`click.${column}`)
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<{ key: string | null; count: string }>();

    return rows.map(
      (row) =>
        new ShortLinkBreakdownItemDTO({
          key: row.key ?? null,
          count: Number(row.count),
        }),
    );
  }

  private periodStart(period: ClickTimePeriod): Date {
    const now = Date.now();
    switch (period) {
      case ClickTimePeriod.DAY:
        return new Date(now - 24 * 60 * 60 * 1000);
      case ClickTimePeriod.MONTH:
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case ClickTimePeriod.WEEK:
      default:
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private async resolveGeo(
    ip?: string,
  ): Promise<{ country?: string; region?: string; city?: string } | undefined> {
    if (!ip) {
      return undefined;
    }

    try {
      const details = await this.ipDetailsService.getIpDetails(ip);

      return {
        country: details.country,
        region: details.region,
        city: details.city,
      };
    } catch {
      return undefined;
    }
  }

  private extractDomain(url?: string): string | undefined {
    if (!url) {
      return undefined;
    }

    try {
      return new URL(url).hostname;
    } catch {
      return undefined;
    }
  }

  private normalizeLanguage(language?: string): string | undefined {
    if (!language) {
      return undefined;
    }

    return language.split(',')[0]?.trim() || undefined;
  }
}

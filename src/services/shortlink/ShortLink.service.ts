import { ConflictException } from 'core/exceptions/Conflict.exception';
import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';
import { generateShortLinkSlug } from 'core/utils/generateShortLinkSlug';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  SHORT_LINK_CLICK_JOB,
  SHORT_LINK_CLICK_QUEUE,
} from 'queues/shortlink/ShortLinkQueue.constants';
import { ILike, Repository } from 'typeorm';

import { PageDTO } from 'models/dto/Page.dto';
import { CreateShortLinkDTO } from 'models/dto/shortlink/CreateShortLink.dto';
import { ShortLinkDTO } from 'models/dto/shortlink/ShortLink.dto';
import { ShortLinkFilters } from 'models/dto/shortlink/ShortLinkFilters.dto';
import { UpdateShortLinkDTO } from 'models/dto/shortlink/UpdateShortLink.dto';
import { Organization } from 'models/entity/Organization.entity';
import { ShortLink } from 'models/entity/shortlink/ShortLink.entity';
import { ShortLinkMapper } from 'models/mappers/shortlink/ShortLink.mapper';

import type { ShortLinkClickJobData } from 'queues/shortlink/ShortLinkQueue.types';

const DEFAULT_DOMAIN = 'traque.app';
const SLUG_GENERATION_ATTEMPTS = 5;

export type ClickContext = {
  ip?: string;
  userAgent?: string;
  referer?: string;
  language?: string;
};

@Injectable()
export class ShortLinkService {
  private readonly logger = new Logger(ShortLinkService.name);

  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
    private readonly shortLinkMapper: ShortLinkMapper,
    @InjectQueue(SHORT_LINK_CLICK_QUEUE)
    private readonly clickQueue: Queue<ShortLinkClickJobData>,
  ) {}

  async getShortLinks(
    organization: Organization,
    pageable: Pageable<ShortLink>,
    filters: ShortLinkFilters,
  ): Promise<PageDTO<ShortLinkDTO>> {
    const where: Record<string, any> = {
      organization: { id: organization.id },
    };

    if (filters.search) {
      where.slug = ILike(`%${filters.search}%`);
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const page = await paginate<ShortLink>(
      this.shortLinkRepository,
      {
        page: pageable.page,
        limit: pageable.size,
      },
      {
        where,
        order: pageable.sort ?? { createdAt: 'DESC' },
      },
    );

    return this.shortLinkMapper.mapToPage(page);
  }

  async getShortLinkById(
    organization: Organization,
    shortLinkId: string,
  ): Promise<ShortLinkDTO> {
    const shortLink = await this.findShortLinkEntity(organization, shortLinkId);

    return this.shortLinkMapper.toDTO(shortLink);
  }

  async findShortLinkEntity(
    organization: Organization,
    shortLinkId: string,
  ): Promise<ShortLink> {
    const shortLink = await this.shortLinkRepository.findOne({
      where: { id: shortLinkId, organization: { id: organization.id } },
    });

    if (!shortLink) {
      throw new NotFoundException({ message: 'Short link not found' });
    }

    return shortLink;
  }

  async createShortLink(
    organization: Organization,
    dto: CreateShortLinkDTO,
  ): Promise<ShortLinkDTO> {
    const domain = dto.domain ?? DEFAULT_DOMAIN;
    const slug = dto.slug
      ? await this.ensureSlugAvailable(domain, dto.slug)
      : await this.generateUniqueSlug(domain);

    const shortLink = new ShortLink({
      slug,
      domain,
      destinationUrl: dto.destinationUrl,
      title: dto.title,
      description: dto.description,
      isActive: dto.isActive ?? true,
      expiresAt: dto.expiresAt,
      clickLimit: dto.clickLimit,
      clickCount: 0,
      metadata: dto.metadata,
    });

    shortLink.organization = organization;

    const saved = await this.shortLinkRepository.save(shortLink);

    this.logger.log(
      `Created short link ${saved.id} (${domain}/${slug}) for org ${organization.id}`,
    );

    return this.shortLinkMapper.toDTO(saved);
  }

  async updateShortLink(
    organization: Organization,
    shortLinkId: string,
    dto: UpdateShortLinkDTO,
  ): Promise<ShortLinkDTO> {
    const shortLink = await this.findShortLinkEntity(organization, shortLinkId);

    Object.assign(shortLink, dto);

    const saved = await this.shortLinkRepository.save(shortLink);

    return this.shortLinkMapper.toDTO(saved);
  }

  async deleteShortLink(
    organization: Organization,
    shortLinkId: string,
  ): Promise<void> {
    const shortLink = await this.findShortLinkEntity(organization, shortLinkId);

    await this.shortLinkRepository.remove(shortLink);

    this.logger.log(`Deleted short link ${shortLinkId}`);
  }

  async resolveBySlug(domain: string, slug: string): Promise<ShortLink> {
    const shortLink = await this.shortLinkRepository.findOne({
      where: { domain, slug },
    });

    if (!shortLink || !shortLink.isActive) {
      throw new NotFoundException({ message: 'Short link not found' });
    }

    if (shortLink.expiresAt && shortLink.expiresAt.getTime() <= Date.now()) {
      throw new NotFoundException({ message: 'Short link has expired' });
    }

    if (
      shortLink.clickLimit !== undefined &&
      shortLink.clickLimit !== null &&
      shortLink.clickCount >= shortLink.clickLimit
    ) {
      throw new NotFoundException({
        message: 'Short link click limit reached',
      });
    }

    return shortLink;
  }

  async queueClick(shortLink: ShortLink, context: ClickContext): Promise<void> {
    await this.clickQueue.add(
      SHORT_LINK_CLICK_JOB,
      {
        shortLinkId: shortLink.id,
        clickedAt: new Date().toISOString(),
        ip: context.ip,
        userAgent: context.userAgent,
        referer: context.referer,
        language: context.language,
      },
      { removeOnComplete: true, removeOnFail: 1000 },
    );
  }

  private async ensureSlugAvailable(
    domain: string,
    slug: string,
  ): Promise<string> {
    const existing = await this.shortLinkRepository.findOne({
      where: { domain, slug },
    });

    if (existing) {
      throw new ConflictException({
        message: `Slug "${slug}" is already in use on ${domain}`,
      });
    }

    return slug;
  }

  private async generateUniqueSlug(domain: string): Promise<string> {
    for (let attempt = 0; attempt < SLUG_GENERATION_ATTEMPTS; attempt++) {
      const slug = generateShortLinkSlug();

      const existing = await this.shortLinkRepository.findOne({
        where: { domain, slug },
      });

      if (!existing) {
        return slug;
      }
    }

    throw new ConflictException({
      message: 'Could not generate a unique slug, please try again',
    });
  }
}

import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { BugActivityDTO } from 'models/dto/BugActivity.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Bug } from 'models/entity/Bug.entity';
import { BugActivity } from 'models/entity/BugActivity.entity';
import { User } from 'models/entity/User.entity';
import { BugActivityMapper } from 'models/mappers/BugActivity.mapper';
import { BugActivityType } from 'models/types/BugActivityType';

@Injectable()
export class BugActivityService {
  constructor(
    @InjectRepository(BugActivity)
    private readonly activityRepository: Repository<BugActivity>,
    private readonly activityMapper: BugActivityMapper,
  ) {}

  async record(
    bug: Bug,
    type: BugActivityType,
    actor: User | undefined,
    oldValue?: string,
    newValue?: string,
  ): Promise<void> {
    const activity = new BugActivity({
      type,
      oldValue,
      newValue,
    });

    activity.bug = bug;
    activity.actor = actor;

    await this.activityRepository.save(activity);
  }

  async paginateActivities(
    bugId: string,
    { page, size, sort }: Pageable<BugActivity>,
  ): Promise<PageDTO<BugActivityDTO>> {
    const pagination = await paginate(
      this.activityRepository,
      { page, limit: size },
      {
        where: { bug: { id: bugId } },
        relations: { actor: true },
        order: sort ?? { createdAt: 'DESC' },
      },
    );

    return this.activityMapper.mapToPage(pagination);
  }
}

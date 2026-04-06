import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { FeedbackActivityDTO } from 'models/dto/FeedbackActivity.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Feedback } from 'models/entity/Feedback.entity';
import { FeedbackActivity } from 'models/entity/FeedbackActivity.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackActivityMapper } from 'models/mappers/FeedbackActivity.mapper';
import { FeedbackActivityType } from 'models/types/FeedbackActivityType';

@Injectable()
export class FeedbackActivityService {
  constructor(
    @InjectRepository(FeedbackActivity)
    private readonly activityRepository: Repository<FeedbackActivity>,
    private readonly activityMapper: FeedbackActivityMapper,
  ) {}

  async record(
    feedback: Feedback,
    type: FeedbackActivityType,
    actor: User | undefined,
    oldValue?: string,
    newValue?: string,
  ): Promise<void> {
    const activity = new FeedbackActivity({ type, oldValue, newValue });

    activity.feedback = feedback;
    activity.actor = actor;

    await this.activityRepository.save(activity);
  }

  async paginateActivities(
    feedbackId: string,
    { page, size, sort }: Pageable<FeedbackActivity>,
  ): Promise<PageDTO<FeedbackActivityDTO>> {
    const pagination = await paginate(
      this.activityRepository,
      { page, limit: size },
      {
        where: { feedback: { id: feedbackId } },
        relations: { actor: true },
        order: sort ?? { createdAt: 'DESC' },
      },
    );

    return this.activityMapper.mapToPage(pagination);
  }
}

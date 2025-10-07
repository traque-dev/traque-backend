import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Subscription } from 'models/entity/Subscription.entity';

export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  getSubscriptions(organizationId: string, active?: boolean) {
    return this.subscriptionRepo.find({
      where: {
        referenceId: organizationId,
        status: active ? In(['active', 'trialing']) : undefined,
      },
    });
  }
}

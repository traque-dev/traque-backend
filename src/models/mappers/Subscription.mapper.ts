import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { SubscriptionDTO } from 'models/dto/Subscription.dto';
import { Subscription } from 'models/entity/Subscription.entity';

@Injectable()
export class SubscriptionMapper
  implements BaseMapper<Subscription, SubscriptionDTO>
{
  toDTO(entity: Subscription): SubscriptionDTO {
    return new SubscriptionDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      plan: entity.plan,
      referenceId: entity.referenceId,
      stripeCustomerId: entity.stripeCustomerId,
      stripeSubscriptionId: entity.stripeSubscriptionId,
      polarCustomerId: entity.polarCustomerId,
      polarSubscriptionId: entity.polarSubscriptionId,
      status: entity.status,
      periodStart: entity.periodStart,
      periodEnd: entity.periodEnd,
      cancelAtPeriodEnd: entity.cancelAtPeriodEnd,
      seats: entity.seats,
      trialStart: entity.trialStart,
      trialEnd: entity.trialEnd,
      source: entity.source,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntity(dto: SubscriptionDTO): Subscription | Promise<Subscription> {
    throw new Error('Method not implemented.');
  }
}

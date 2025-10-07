import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Subscription as PolarSubscription } from '@polar-sh/sdk/models/components/subscription';
import { Column, Entity, Unique } from 'typeorm';

import { SubscriptionSource } from 'models/types/SubscriptionSource';

import { BaseEntity } from './Base.entity';

type SubscriptionConstructorParams = ExtractEntityProps<Subscription>;

@Unique(['polarSubscriptionId'])
@Entity({
  name: 'subscriptions',
})
export class Subscription extends BaseEntity {
  @Column({
    type: 'text',
  })
  plan: string;

  @Column({
    type: 'text',
    name: 'reference_id',
  })
  referenceId: string;

  @Column({
    type: 'text',
    name: 'stripe_customer_id',
    nullable: true,
  })
  stripeCustomerId?: string;

  @Column({
    type: 'text',
    name: 'stripe_subscription_id',
    nullable: true,
  })
  stripeSubscriptionId?: string;

  @Column({
    type: 'text',
    name: 'polar_customer_id',
    nullable: true,
  })
  polarCustomerId?: string;

  @Column({
    type: 'text',
    name: 'polar_subscription_id',
    nullable: true,
    unique: true,
  })
  polarSubscriptionId?: string;

  @Column({
    type: 'text',
    name: 'status',
  })
  status: string;

  @Column({
    type: 'timestamp',
    name: 'period_start',
    nullable: true,
  })
  periodStart?: Date;

  @Column({
    type: 'timestamp',
    name: 'period_end',
    nullable: true,
  })
  periodEnd?: Date;

  @Column({
    type: 'boolean',
    name: 'cancel_at_period_end',
    nullable: true,
  })
  cancelAtPeriodEnd?: boolean;

  @Column({
    type: 'int',
    name: 'seats',
    nullable: true,
  })
  seats?: number;

  @Column({
    type: 'timestamp',
    name: 'trial_start',
    nullable: true,
  })
  trialStart?: Date;

  @Column({
    type: 'timestamp',
    name: 'trial_end',
    nullable: true,
  })
  trialEnd?: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionSource,
  })
  source: SubscriptionSource;

  constructor(props: SubscriptionConstructorParams) {
    super();

    Object.assign(this, props);
  }

  isPlus(): boolean {
    return this.plan === 'plus';
  }

  static fromPolar({
    id,
    customerId,
    status,
    product,
    metadata,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  }: PolarSubscription) {
    return new Subscription({
      polarSubscriptionId: id,
      polarCustomerId: customerId,
      plan: product.metadata.slug as string,
      referenceId: metadata.referenceId as string,
      status: status,
      source: SubscriptionSource.POLAR,
      periodStart: currentPeriodStart,
      periodEnd: currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd,
    });
  }
}

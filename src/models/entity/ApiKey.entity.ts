import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';
import { User } from 'models/entity/User.entity';

type ApiKeyConstructorProps = ExtractEntityProps<ApiKey>;

@Entity({
  name: 'api_keys',
})
export class ApiKey extends BaseEntity {
  /**
   * The id of the organization who owns the API key.
   * */
  @ManyToOne(() => Organization, {
    nullable: true,
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization: Organization;

  /**
   * The name of the API key.
   * */
  @Column({
    type: 'text',
    nullable: true,
  })
  name?: string;

  /**
   * The starting characters of the API key.
   * Useful for showing the first few characters of the API key in the UI for the users to easily identify.
   * */
  @Column({
    type: 'text',
    nullable: true,
  })
  start?: string;

  /**
   * The API Key prefix. Stored as plain text.
   * */
  @Column({
    type: 'text',
    nullable: true,
  })
  prefix?: string;

  /**
   * The hashed API key itself.
   * */
  @Column({
    type: 'text',
  })
  key: string;

  /**
   * The id of the user who created the API key.
   * */
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  /**
   * The interval to refill the key in milliseconds.
   * */
  @Column({
    type: 'int8',
    nullable: true,
    name: 'refill_interval',
  })
  refillInterval?: number | null;

  /**
   * The amount to refill the remaining count of the key.
   * */
  @Column({
    type: 'int8',
    nullable: true,
    name: 'refill_amount',
  })
  refillAmount?: number | null;

  /**
   * The date and time when the key was last refilled.
   * */
  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'last_refill_at',
  })
  lastRefillAt?: Date | null;

  /**
   * Whether the API key is enabled.
   * */
  @Column({
    type: 'boolean',
  })
  enabled: boolean;

  /**
   * Whether the API key has rate limiting enabled.
   * */
  @Column({
    type: 'boolean',
    name: 'rate_limit_enabled',
  })
  rateLimitEnabled: boolean;

  /**
   * The time window in milliseconds for the rate limit.
   * */
  @Column({
    type: 'int',
    nullable: true,
    name: 'rate_limit_time_window',
  })
  rateLimitTimeWindow: number | null;

  /**
   * The maximum number of requests allowed within the `rateLimitTimeWindow`.
   * */
  @Column({
    type: 'int8',
    nullable: true,
    name: 'rate_limit_max',
  })
  rateLimitMax?: number | null;

  /**
   * The number of requests made within the rate limit time window.
   * */
  @Column({
    type: 'int8',
    name: 'request_count',
  })
  requestCount: number;

  /**
   * The number of requests remaining.
   * */
  @Column({
    type: 'int8',
    nullable: true,
  })
  remaining?: number | null;

  /**
   * The date and time of the last request made to the key.
   * */
  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'last_request',
  })
  lastRequest?: Date | null;

  /**
   * The date and time when the key will expire.
   * */
  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'expires_at',
  })
  expiresAt?: Date;

  /**
   * The permissions of the key.
   * */
  @Column({
    type: 'text',
    nullable: true,
  })
  permissions?: string | null;

  /**
   * Any additional metadata you want to store with the key.
   * */
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, unknown> | null;

  rawKey?: string;

  constructor(props: ApiKeyConstructorProps) {
    super();

    Object.assign(this, props);
  }
}

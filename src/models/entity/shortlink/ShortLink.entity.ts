import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';

type ShortLinkConstructorParams = Omit<
  ExtractEntityProps<ShortLink>,
  'organization'
>;

@Entity({ name: 'short_links' })
@Index(['organization'])
@Index(['domain', 'slug'], { unique: true })
export class ShortLink extends BaseEntity {
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'text' })
  slug: string;

  @Column({ type: 'text', default: 'traque.app' })
  domain: string;

  @Column({ name: 'destination_url', type: 'text' })
  destinationUrl: string;

  @Column({ type: 'text', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'click_limit', type: 'int', nullable: true })
  clickLimit?: number;

  @Column({ name: 'click_count', type: 'int', default: 0 })
  clickCount: number;

  @Column({ name: 'last_clicked_at', type: 'timestamptz', nullable: true })
  lastClickedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  constructor(props: ShortLinkConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

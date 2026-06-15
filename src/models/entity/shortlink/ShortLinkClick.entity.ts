import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { ShortLink } from 'models/entity/shortlink/ShortLink.entity';
import { ClickDeviceType } from 'models/types/shortlink/ClickDeviceType';

type ShortLinkClickConstructorParams = Omit<
  ExtractEntityProps<ShortLinkClick>,
  'shortLink'
>;

@Entity({ name: 'short_link_clicks' })
@Index(['shortLink', 'clickedAt'])
export class ShortLinkClick extends BaseEntity {
  @ManyToOne(() => ShortLink, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'short_link_id' })
  shortLink: ShortLink;

  @Column({ name: 'clicked_at', type: 'timestamptz' })
  clickedAt: Date;

  @Column({ name: 'ip_address', type: 'text', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  country?: string;

  @Column({ type: 'text', nullable: true })
  region?: string;

  @Column({ type: 'text', nullable: true })
  city?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: ClickDeviceType,
    default: ClickDeviceType.UNKNOWN,
  })
  deviceType: ClickDeviceType;

  @Column({ type: 'text', nullable: true })
  browser?: string;

  @Column({ type: 'text', nullable: true })
  os?: string;

  @Column({ type: 'text', nullable: true })
  referer?: string;

  @Column({ name: 'referer_domain', type: 'text', nullable: true })
  refererDomain?: string;

  @Column({ type: 'text', nullable: true })
  language?: string;

  @Column({ name: 'is_bot', type: 'boolean', default: false })
  isBot: boolean;

  constructor(props: ShortLinkClickConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

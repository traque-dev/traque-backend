import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';
import { IncidentTimelineEntry } from 'models/entity/uptime/IncidentTimelineEntry.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { User } from 'models/entity/User.entity';
import { IncidentStatus } from 'models/types/uptime/IncidentStatus';

type IncidentConstructorParams = Omit<
  ExtractEntityProps<Incident>,
  'monitor' | 'organization' | 'acknowledgedBy' | 'timelineEntries'
>;

@Entity({ name: 'uptime_incidents' })
@Index(['organization'])
@Index(['monitor', 'status'])
export class Incident extends BaseEntity {
  @ManyToOne(() => Monitor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'monitor_id' })
  monitor: Monitor;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'enum', enum: IncidentStatus })
  status: IncidentStatus;

  @Column({ type: 'text' })
  cause: string;

  @Column({ name: 'checked_url', type: 'text' })
  checkedUrl: string;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'acknowledged_at', type: 'timestamptz', nullable: true })
  acknowledgedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by_id' })
  acknowledgedBy?: User;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @Column({
    name: 'resolved_automatically',
    type: 'boolean',
    default: false,
  })
  resolvedAutomatically: boolean;

  @OneToMany(() => IncidentTimelineEntry, (entry) => entry.incident)
  timelineEntries?: IncidentTimelineEntry[];

  constructor(props: IncidentConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

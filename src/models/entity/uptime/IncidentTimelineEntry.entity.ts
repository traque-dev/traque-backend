import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Incident } from 'models/entity/uptime/Incident.entity';
import { IncidentTimelineEntryType } from 'models/types/uptime/IncidentTimelineEntryType';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';

type TimelineEntryConstructorParams = Omit<
  ExtractEntityProps<IncidentTimelineEntry>,
  'incident'
>;

@Entity({ name: 'uptime_incident_timeline_entries' })
export class IncidentTimelineEntry extends BaseEntity {
  @ManyToOne(() => Incident, (incident) => incident.timelineEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @Column({ type: 'enum', enum: IncidentTimelineEntryType })
  type: IncidentTimelineEntryType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: MonitorRegion, nullable: true })
  region?: MonitorRegion;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  constructor(props: TimelineEntryConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

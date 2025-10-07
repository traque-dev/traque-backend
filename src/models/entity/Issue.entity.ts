import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Project } from 'models/entity/Project.entity';
import { IssueSeverity } from 'models/types/IssueSeverity';
import { IssueStatus } from 'models/types/IssueStatus';

@Entity({
  name: 'issues',
})
export class Issue extends BaseEntity {
  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  @Column({
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: IssueStatus,
  })
  status: IssueStatus;

  @Column({
    type: 'enum',
    enum: IssueSeverity,
  })
  severity: IssueSeverity;

  @Column({
    type: 'timestamp',
  })
  firstSeen: Date;

  @Column({
    type: 'timestamp',
  })
  lastSeen: Date;

  @Column({
    type: 'int8',
  })
  eventCount: number;

  constructor(props: ExtractEntityProps<Issue>) {
    super();

    Object.assign(this, props);
  }
}

import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { BugActivity } from 'models/entity/BugActivity.entity';
import { BugComment } from 'models/entity/BugComment.entity';
import { BugLabel } from 'models/entity/BugLabel.entity';
import { BugReproductionStep } from 'models/entity/BugReproductionStep.entity';
import { Exception } from 'models/entity/Exception.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { BugPriority } from 'models/types/BugPriority';
import { BugSource } from 'models/types/BugSource';
import { BugStatus } from 'models/types/BugStatus';

type BugConstructorParams = Omit<
  ExtractEntityProps<Bug>,
  | 'project'
  | 'reporter'
  | 'assignee'
  | 'exception'
  | 'labels'
  | 'comments'
  | 'activities'
  | 'steps'
>;

@Entity({
  name: 'bugs',
})
export class Bug extends BaseEntity {
  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: BugStatus,
  })
  status: BugStatus;

  @Column({
    type: 'enum',
    enum: BugPriority,
  })
  priority: BugPriority;

  @Column({
    type: 'text',
    nullable: true,
  })
  environment?: string;

  @Column({
    name: 'expected_behavior',
    type: 'text',
    nullable: true,
  })
  expectedBehavior?: string;

  @Column({
    name: 'actual_behavior',
    type: 'text',
    nullable: true,
  })
  actualBehavior?: string;

  @Column({
    name: 'browser_context',
    type: 'jsonb',
    nullable: true,
  })
  browserContext?: Record<string, any>;

  @Column({
    name: 'server_context',
    type: 'jsonb',
    nullable: true,
  })
  serverContext?: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  breadcrumbs?: Record<string, any>[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: BugSource,
  })
  source: BugSource;

  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'reporter_id',
  })
  reporter?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'assignee_id',
  })
  assignee?: User;

  @ManyToOne(() => Exception, { nullable: true })
  @JoinColumn({
    name: 'exception_id',
  })
  exception?: Exception;

  @OneToMany(() => BugReproductionStep, (step) => step.bug, {
    cascade: true,
  })
  steps?: BugReproductionStep[];

  @ManyToMany(() => BugLabel, (label) => label.bugs)
  @JoinTable({
    name: 'bug_label_bugs',
    joinColumn: { name: 'bug_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels?: BugLabel[];

  @OneToMany(() => BugComment, (comment) => comment.bug)
  comments?: BugComment[];

  @OneToMany(() => BugActivity, (activity) => activity.bug)
  activities?: BugActivity[];

  constructor(props: BugConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

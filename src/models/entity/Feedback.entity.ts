import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { FeedbackActivity } from 'models/entity/FeedbackActivity.entity';
import { FeedbackComment } from 'models/entity/FeedbackComment.entity';
import { FeedbackFile } from 'models/entity/FeedbackFile.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackImpact } from 'models/types/FeedbackImpact';
import { FeedbackPriority } from 'models/types/FeedbackPriority';
import { FeedbackSource } from 'models/types/FeedbackSource';
import { FeedbackStatus } from 'models/types/FeedbackStatus';
import { FeedbackType } from 'models/types/FeedbackType';

type FeedbackConstructorParams = Omit<
  ExtractEntityProps<Feedback>,
  'project' | 'reporter' | 'assignee' | 'files' | 'comments' | 'activities'
>;

@Entity({
  name: 'feedback',
})
export class Feedback extends BaseEntity {
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
    enum: FeedbackType,
  })
  type: FeedbackType;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
  })
  status: FeedbackStatus;

  @Column({
    type: 'enum',
    enum: FeedbackPriority,
  })
  priority: FeedbackPriority;

  @Column({
    type: 'enum',
    enum: FeedbackImpact,
    nullable: true,
  })
  impact?: FeedbackImpact;

  @Column({
    type: 'enum',
    enum: FeedbackSource,
  })
  source: FeedbackSource;

  @Column({
    name: 'submitter_name',
    type: 'text',
    nullable: true,
  })
  submitterName?: string;

  @Column({
    name: 'submitter_email',
    type: 'text',
    nullable: true,
  })
  submitterEmail?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>;

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

  @OneToMany(() => FeedbackFile, (ff) => ff.feedback)
  files?: FeedbackFile[];

  @OneToMany(() => FeedbackComment, (comment) => comment.feedback)
  comments?: FeedbackComment[];

  @OneToMany(() => FeedbackActivity, (activity) => activity.feedback)
  activities?: FeedbackActivity[];

  constructor(props: FeedbackConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

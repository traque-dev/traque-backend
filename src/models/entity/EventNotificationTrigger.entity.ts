import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

import { Project } from './Project.entity';

type EventNotificationTriggerConstructorProps = Omit<
  ExtractEntityProps<EventNotificationTrigger>,
  'id' | 'createdAt' | 'updatedAt' | 'project'
>;

@Entity({
  name: 'event_notification_triggers',
})
export class EventNotificationTrigger extends BaseEntity {
  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  @Column({
    type: 'text',
    name: 'on_event',
  })
  onEvent: string;

  @Column({
    type: 'boolean',
    name: 'mobile_push',
    nullable: true,
    default: false,
  })
  mobilePush: boolean;

  @Column({
    type: 'boolean',
    name: 'discord',
    nullable: true,
    default: false,
  })
  discord: boolean;

  @Column({
    type: 'boolean',
    name: 'email',
    nullable: true,
    default: false,
  })
  email: boolean;

  constructor(props: EventNotificationTriggerConstructorProps) {
    super();

    Object.assign(this, props);
  }

  forProject(project: Project) {
    this.project = project;

    return this;
  }

  withId(id: string) {
    this.id = id;

    return this;
  }
}

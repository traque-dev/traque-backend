import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { UIMessage } from 'ai';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';

@Entity({
  name: 'conversations',
})
export class Conversation extends BaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    nullable: false,
  })
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(() => Project, {
    nullable: true,
  })
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  @Column({
    type: 'text',
    default: 'New Chat',
  })
  name: string;

  @Column({
    name: 'system_prompt',
    type: 'text',
    nullable: true,
  })
  systemPrompt: string;

  @Column({
    type: 'jsonb',
    default: [],
  })
  messages: UIMessage[];

  constructor(props: ExtractEntityProps<Conversation>) {
    super();

    Object.assign(this, props);
  }
}

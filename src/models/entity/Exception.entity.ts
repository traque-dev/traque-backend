import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { ExceptionFrame } from 'models/entity/ExceptionFrame.entity';
import { HttpContext } from 'models/entity/HttpContext.entity';
import { Issue } from 'models/entity/Issue.entity';
import { Project } from 'models/entity/Project.entity';
import { EventEnvironment } from 'models/types/EventEnvironment';
import { EventPlatform } from 'models/types/EventPlatform';

type ExceptionConstructorParams = Omit<
  ExtractEntityProps<Exception>,
  'issue' | 'project'
>;

@Entity({
  name: 'exceptions',
})
export class Exception extends BaseEntity {
  @ManyToOne(() => Issue)
  @JoinColumn({
    name: 'issue_id',
  })
  issue: Issue;

  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  @Column({
    type: 'enum',
    enum: EventEnvironment,
  })
  environment: EventEnvironment;

  @Column({
    type: 'enum',
    enum: EventPlatform,
    nullable: true,
  })
  platform?: EventPlatform;

  @Column()
  name: string;

  @Column()
  message: string;

  @Column({
    nullable: true,
  })
  details?: string;

  @Column({
    nullable: true,
  })
  suggestion?: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  stack?: string;

  @OneToMany(() => ExceptionFrame, (frame) => frame.exception, {
    cascade: true,
  })
  frames?: ExceptionFrame[];

  @OneToOne(() => HttpContext, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({
    name: 'http_context_id',
  })
  httpContext?: HttpContext;

  constructor(props: ExceptionConstructorParams) {
    super();

    Object.assign(this, props);
  }

  withIssue(issue: Issue) {
    this.issue = issue;

    return this;
  }

  forProject(project: Project) {
    this.project = project;

    return this;
  }

  withHttpContext(httpContext: HttpContext) {
    this.httpContext = httpContext;

    return this;
  }

  withFrames(frames: ExceptionFrame[]) {
    this.frames = frames;

    return this;
  }
}

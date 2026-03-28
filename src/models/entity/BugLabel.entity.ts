import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Bug } from 'models/entity/Bug.entity';
import { Project } from 'models/entity/Project.entity';

type BugLabelConstructorParams = Omit<
  ExtractEntityProps<BugLabel>,
  'project' | 'bugs'
>;

@Entity({
  name: 'bug_labels',
})
export class BugLabel extends BaseEntity {
  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  color: string;

  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project: Project;

  @ManyToMany(() => Bug, (bug) => bug.labels)
  bugs?: Bug[];

  constructor(props: BugLabelConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

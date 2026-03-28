import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Bug } from 'models/entity/Bug.entity';

type BugReproductionStepConstructorParams = Omit<
  ExtractEntityProps<BugReproductionStep>,
  'bug'
>;

@Entity({
  name: 'bug_reproduction_steps',
})
export class BugReproductionStep extends BaseEntity {
  @Column({
    type: 'int',
  })
  order: number;

  @Column({
    type: 'text',
  })
  description: string;

  @ManyToOne(() => Bug, (bug) => bug.steps, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'bug_id',
  })
  bug: Bug;

  constructor(props: BugReproductionStepConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

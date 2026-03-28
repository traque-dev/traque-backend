import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Bug } from 'models/entity/Bug.entity';
import { User } from 'models/entity/User.entity';
import { BugActivityType } from 'models/types/BugActivityType';

@Entity({
  name: 'bug_activities',
})
export class BugActivity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BugActivityType,
  })
  type: BugActivityType;

  @Column({
    name: 'old_value',
    type: 'text',
    nullable: true,
  })
  oldValue?: string;

  @Column({
    name: 'new_value',
    type: 'text',
    nullable: true,
  })
  newValue?: string;

  @ManyToOne(() => Bug, (bug) => bug.activities, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'bug_id',
  })
  bug: Bug;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'actor_id',
  })
  actor?: User;

  constructor(
    props?: Partial<Pick<BugActivity, 'type' | 'oldValue' | 'newValue'>>,
  ) {
    super();

    if (props) {
      Object.assign(this, props);
    }
  }
}

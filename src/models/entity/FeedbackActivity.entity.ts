import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Feedback } from 'models/entity/Feedback.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackActivityType } from 'models/types/FeedbackActivityType';

@Entity({
  name: 'feedback_activities',
})
export class FeedbackActivity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: FeedbackActivityType,
  })
  type: FeedbackActivityType;

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

  @ManyToOne(() => Feedback, (feedback) => feedback.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'feedback_id',
  })
  feedback: Feedback;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'actor_id',
  })
  actor?: User;

  constructor(
    props?: Partial<Pick<FeedbackActivity, 'type' | 'oldValue' | 'newValue'>>,
  ) {
    super();

    if (props) {
      Object.assign(this, props);
    }
  }
}

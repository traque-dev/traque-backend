import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Feedback } from 'models/entity/Feedback.entity';
import { User } from 'models/entity/User.entity';

type FeedbackCommentConstructorParams = Omit<
  ExtractEntityProps<FeedbackComment>,
  'feedback' | 'author' | 'parent'
>;

@Entity({
  name: 'feedback_comments',
})
export class FeedbackComment extends BaseEntity {
  @Column({
    type: 'text',
  })
  body: string;

  @ManyToOne(() => Feedback, (feedback) => feedback.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'feedback_id',
  })
  feedback: Feedback;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'author_id',
  })
  author: User;

  @ManyToOne(() => FeedbackComment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'parent_id',
  })
  parent?: FeedbackComment;

  constructor(props: FeedbackCommentConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

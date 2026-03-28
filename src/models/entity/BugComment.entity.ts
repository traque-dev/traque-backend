import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Bug } from 'models/entity/Bug.entity';
import { User } from 'models/entity/User.entity';

type BugCommentConstructorParams = Omit<
  ExtractEntityProps<BugComment>,
  'bug' | 'author' | 'parent'
>;

@Entity({
  name: 'bug_comments',
})
export class BugComment extends BaseEntity {
  @Column({
    type: 'text',
  })
  body: string;

  @ManyToOne(() => Bug, (bug) => bug.comments, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'bug_id',
  })
  bug: Bug;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'author_id',
  })
  author: User;

  @ManyToOne(() => BugComment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'parent_id',
  })
  parent?: BugComment;

  constructor(props: BugCommentConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

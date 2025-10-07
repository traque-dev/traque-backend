import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';
import { User } from 'models/entity/User.entity';

@Entity({
  name: 'members',
})
export class Member extends BaseEntity {
  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organization_id',
  })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    type: 'text',
    nullable: false,
  })
  role: string;
}

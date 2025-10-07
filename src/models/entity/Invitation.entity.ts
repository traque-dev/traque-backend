import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';
import { User } from 'models/entity/User.entity';

@Entity({
  name: 'invitations',
})
export class Invitation extends BaseEntity {
  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organization_id',
  })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'inviter_id',
  })
  inviter: User;

  @Column({
    type: 'text',
    nullable: false,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  role: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  status: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: false,
  })
  expiresAt: Date;
}

import { Entity, Column, OneToMany } from 'typeorm';

import { Account } from 'models/entity/Account.entity';
import { BaseEntity } from 'models/entity/Base.entity';
import { Session } from 'models/entity/Session.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column('text')
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column({
    type: 'boolean',
    name: 'email_verified',
  })
  emailVerified: boolean;

  @Column('text', {
    nullable: true,
  })
  image: string | null;

  @Column({
    nullable: true,
    type: 'boolean',
    name: 'two_factor_enabled',
  })
  twoFactorEnabled: boolean;

  @Column({
    nullable: true,
    type: 'boolean',
    name: 'is_anonymous',
  })
  isAnonymous: boolean;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
}

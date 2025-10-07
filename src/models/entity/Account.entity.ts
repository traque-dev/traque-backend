import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { User } from 'models/entity/User.entity';

@Entity('accounts')
export class Account extends BaseEntity {
  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    type: 'text',
    name: 'account_id',
  })
  accountId: string;

  @Column({
    type: 'text',
    name: 'provider_id',
  })
  providerId: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'access_token',
  })
  accessToken: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'refresh_token',
  })
  refreshToken: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'id_token',
  })
  idToken: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'access_token_expires_at',
  })
  accessTokenExpiresAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'refresh_token_expires_at',
  })
  refreshTokenExpiresAt: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  scope: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  password: string | null;
}

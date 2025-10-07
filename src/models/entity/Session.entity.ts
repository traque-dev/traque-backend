import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { User } from 'models/entity/User.entity';

@Entity('sessions')
export class Session extends BaseEntity {
  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column('text', {
    unique: true,
  })
  token: string;

  @Column('text', {
    name: 'ip_address',
    nullable: true,
  })
  ipAddress: string | null;

  @Column('text', {
    name: 'user_agent',
    nullable: true,
  })
  userAgent: string | null;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    name: 'active_organization_id',
    type: 'text',
    nullable: true,
  })
  activeOrganizationId: string;
}

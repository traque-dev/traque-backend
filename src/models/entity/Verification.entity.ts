import { Entity, Column } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

@Entity('verifications')
export class Verification extends BaseEntity {
  @Column({
    type: 'text',
  })
  identifier: string;

  @Column({
    type: 'text',
  })
  value: string;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt: Date;
}

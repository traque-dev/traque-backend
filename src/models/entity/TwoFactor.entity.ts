import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { User } from 'models/entity/User.entity';

@Entity({
  name: 'two_factor',
})
export class TwoFactor extends BaseEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  secret: string;

  @Column({
    name: 'backup_codes',
    type: 'text',
    nullable: false,
  })
  backupCodes: string;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  userId: User['id'];
}

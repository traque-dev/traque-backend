import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

@Entity({
  name: 'waitlist',
})
export class WaitlistParticipant extends BaseEntity {
  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  email: string;
}

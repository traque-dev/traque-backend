import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

@Entity({
  name: 'organizations',
})
export class Organization extends BaseEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  logo: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata: string;
}

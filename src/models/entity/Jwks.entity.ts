import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

@Entity({
  name: 'jwks',
})
export class Jwks extends BaseEntity {
  @Column({
    name: 'public_key',
    nullable: false,
  })
  publicKey: string;

  @Column({
    name: 'private_key',
    nullable: false,
  })
  privateKey: string;
}

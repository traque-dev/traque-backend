import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

@Entity({
  name: 'ip_addresses',
})
export class IpAddress extends BaseEntity {
  @Column({
    type: 'text',
    unique: true,
  })
  ip: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  city: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  region: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  country: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  location: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  organization: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  postalCode: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  timezone: string;

  constructor(props: ExtractEntityProps<IpAddress>) {
    super();

    Object.assign(this, props);
  }
}

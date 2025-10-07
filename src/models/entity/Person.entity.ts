import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './Base.entity';
import { Organization } from './Organization.entity';

@Entity({
  name: 'persons',
})
export class Person extends BaseEntity {
  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organization_id',
  })
  organization: Organization;

  @Column({
    type: 'text',
    nullable: true,
  })
  externalId: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  properties?: Record<string, unknown>;

  constructor(props: ExtractEntityProps<Person>) {
    super();

    Object.assign(this, props);
  }
}

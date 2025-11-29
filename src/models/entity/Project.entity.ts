import { ExtractEntityProps } from 'core/types/ExtractEntityProps';
import { generateExternalProjectId } from 'core/utils/generateExternalProjectId';

import { Column, Entity, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';
import { EventPlatform } from 'models/types/EventPlatform';

@Entity({
  name: 'projects',
})
export class Project extends BaseEntity {
  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organization_id',
  })
  organization: Organization;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  slug?: string;

  @Column({
    type: 'enum',
    enum: EventPlatform,
    nullable: true,
  })
  platform?: EventPlatform;

  @Column({
    type: 'text',
    name: 'api_key',
  })
  apiKey: string;

  @Column({
    type: 'text',
    name: 'authorized_urls',
    array: true,
    nullable: true,
  })
  authorizedUrls?: string[];

  @Column({
    name: 'external_id',
    type: 'text',
    nullable: true,
    unique: true,
  })
  externalId?: string;

  constructor(props: ExtractEntityProps<Project>) {
    super();

    Object.assign(this, props);
  }

  @BeforeInsert()
  setExternalId() {
    if (!this.externalId) {
      this.externalId = generateExternalProjectId();
    }
  }
}

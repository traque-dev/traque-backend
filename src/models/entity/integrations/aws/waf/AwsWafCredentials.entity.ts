import { encryptionTransformer } from 'core/transformers/Encryption.transformer';
import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';

type AwsWafCredentialsConstructorParams = Omit<
  ExtractEntityProps<AwsWafCredentials>,
  'organization'
>;

@Entity({
  name: 'aws_waf_credentials',
})
export class AwsWafCredentials extends BaseEntity {
  @OneToOne(() => Organization)
  @JoinColumn({
    name: 'organization_id',
  })
  organization: Organization;

  @Column({
    type: 'text',
    transformer: encryptionTransformer,
    nullable: true,
  })
  region: string;

  @Column({
    type: 'text',
    name: 'access_key_id',
    transformer: encryptionTransformer,
    nullable: true,
  })
  accessKeyId: string;

  @Column({
    type: 'text',
    name: 'secret_access_key',
    transformer: encryptionTransformer,
    nullable: true,
  })
  secretAccessKey: string;

  constructor(props: AwsWafCredentialsConstructorParams) {
    super();

    Object.assign(this, props);
  }

  forOrganization(organization: Organization) {
    this.organization = organization;

    return this;
  }
}

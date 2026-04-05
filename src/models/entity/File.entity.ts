import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { User } from 'models/entity/User.entity';
import { FilePurpose } from 'models/types/FilePurpose';

type FileConstructorParams = Omit<ExtractEntityProps<File>, 'uploadedBy'>;

@Entity({
  name: 'files',
})
export class File extends BaseEntity {
  @Column({
    type: 'text',
  })
  key: string;

  @Column({
    name: 'original_name',
    type: 'text',
  })
  originalName: string;

  @Column({
    name: 'mime_type',
    type: 'text',
  })
  mimeType: string;

  @Column({
    type: 'bigint',
  })
  size: number;

  @Column({
    type: 'enum',
    enum: FilePurpose,
  })
  purpose: FilePurpose;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'uploaded_by_id',
  })
  uploadedBy?: User;

  constructor(props: FileConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Exception } from 'models/entity/Exception.entity';

type ExceptionFrameConstructorParams = Omit<
  ExtractEntityProps<ExceptionFrame>,
  'exception'
>;

@Entity({
  name: 'exception_frames',
})
export class ExceptionFrame extends BaseEntity {
  @ManyToOne(() => Exception, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'exception_id',
  })
  exception: Exception;

  @Column({
    type: 'int',
    name: 'frame_index',
    nullable: true,
  })
  frameIndex?: number;

  @Column({
    type: 'text',
    nullable: true,
    name: 'filename',
  })
  filename?: string;

  @Column({
    type: 'text',
    name: 'function_name',
    nullable: true,
  })
  functionName?: string;

  @Column({
    type: 'int',
    name: 'line_number',
    nullable: true,
  })
  lineNumber?: number;

  @Column({
    type: 'int',
    name: 'column_number',
    nullable: true,
  })
  columnNumber?: number;

  @Column({
    type: 'text',
    name: 'absolute_path',
    nullable: true,
  })
  absolutePath?: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'module',
  })
  module?: string;

  @Column({
    type: 'boolean',
    name: 'in_app',
    nullable: true,
  })
  inApp?: boolean;

  @Column({
    type: 'text',
    nullable: true,
    name: 'platform',
  })
  platform?: string;

  constructor(props: ExceptionFrameConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

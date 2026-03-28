import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';

export class BugCommentDTO extends BaseDTO {
  @ApiProperty()
  body: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ nullable: true })
  parentId?: string;

  constructor(props: ExtractProps<BugCommentDTO>) {
    super();

    Object.assign(this, props);
  }
}

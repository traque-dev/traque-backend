import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';

export class BugLabelDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  constructor(props: ExtractProps<BugLabelDTO>) {
    super();

    Object.assign(this, props);
  }
}

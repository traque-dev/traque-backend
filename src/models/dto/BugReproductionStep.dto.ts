import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';

export class BugReproductionStepDTO extends BaseDTO {
  @ApiProperty()
  order: number;

  @ApiProperty()
  description: string;

  constructor(props: ExtractProps<BugReproductionStepDTO>) {
    super();

    Object.assign(this, props);
  }
}

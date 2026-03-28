import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BugActivityType } from 'models/types/BugActivityType';

export class BugActivityDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enum: BugActivityType })
  type: BugActivityType;

  @ApiProperty({ nullable: true })
  oldValue?: string;

  @ApiProperty({ nullable: true })
  newValue?: string;

  @ApiProperty({ nullable: true })
  actorId?: string;

  @ApiProperty({ nullable: true })
  actorName?: string;

  constructor(props: ExtractProps<BugActivityDTO>) {
    Object.assign(this, props);
  }
}

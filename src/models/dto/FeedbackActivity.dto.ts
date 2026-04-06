import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { FeedbackActivityType } from 'models/types/FeedbackActivityType';

export class FeedbackActivityDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enum: FeedbackActivityType })
  type: FeedbackActivityType;

  @ApiProperty({ nullable: true })
  oldValue?: string;

  @ApiProperty({ nullable: true })
  newValue?: string;

  @ApiProperty({ nullable: true })
  actorId?: string;

  @ApiProperty({ nullable: true })
  actorName?: string;

  constructor(props: ExtractProps<FeedbackActivityDTO>) {
    Object.assign(this, props);
  }
}

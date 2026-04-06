import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { FeedbackPriority } from 'models/types/FeedbackPriority';

export class ChangeFeedbackPriorityDTO {
  @ApiProperty({ enum: FeedbackPriority })
  @IsEnum(FeedbackPriority)
  @IsNotEmpty()
  priority: FeedbackPriority;
}

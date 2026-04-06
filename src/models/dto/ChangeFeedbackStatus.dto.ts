import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { FeedbackStatus } from 'models/types/FeedbackStatus';

export class ChangeFeedbackStatusDTO {
  @ApiProperty({ enum: FeedbackStatus })
  @IsEnum(FeedbackStatus)
  @IsNotEmpty()
  status: FeedbackStatus;
}

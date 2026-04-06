import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { FeedbackImpact } from 'models/types/FeedbackImpact';

export class UpdateFeedbackDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: FeedbackImpact, required: false })
  @IsEnum(FeedbackImpact)
  @IsOptional()
  impact?: FeedbackImpact;
}

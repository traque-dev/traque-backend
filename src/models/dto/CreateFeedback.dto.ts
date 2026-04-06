import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { FeedbackPriority } from 'models/types/FeedbackPriority';
import { FeedbackType } from 'models/types/FeedbackType';

export class CreateFeedbackDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: FeedbackType })
  @IsEnum(FeedbackType)
  @IsNotEmpty()
  type: FeedbackType;

  @ApiProperty({ enum: FeedbackPriority })
  @IsEnum(FeedbackPriority)
  @IsNotEmpty()
  priority: FeedbackPriority;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'IDs of pre-uploaded files to attach',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  fileIds?: string[];
}

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { FeedbackPriority } from 'models/types/FeedbackPriority';
import { FeedbackSource } from 'models/types/FeedbackSource';
import { FeedbackStatus } from 'models/types/FeedbackStatus';
import { FeedbackType } from 'models/types/FeedbackType';

export class FeedbackFilters {
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsEnum(FeedbackType)
  @IsOptional()
  type?: FeedbackType;

  @IsEnum(FeedbackPriority)
  @IsOptional()
  priority?: FeedbackPriority;

  @IsEnum(FeedbackSource)
  @IsOptional()
  source?: FeedbackSource;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { BugPriority } from 'models/types/BugPriority';
import { BugSource } from 'models/types/BugSource';
import { BugStatus } from 'models/types/BugStatus';

export class BugFilters {
  @IsEnum(BugStatus)
  @IsOptional()
  status?: BugStatus;

  @IsEnum(BugPriority)
  @IsOptional()
  priority?: BugPriority;

  @IsEnum(BugSource)
  @IsOptional()
  source?: BugSource;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsUUID()
  @IsOptional()
  labelId?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { BugPriority } from 'models/types/BugPriority';

export class ChangeBugPriorityDTO {
  @ApiProperty({ enum: BugPriority })
  @IsEnum(BugPriority)
  @IsNotEmpty()
  priority: BugPriority;
}

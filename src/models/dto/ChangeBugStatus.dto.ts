import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { BugStatus } from 'models/types/BugStatus';

export class ChangeBugStatusDTO {
  @ApiProperty({ enum: BugStatus })
  @IsEnum(BugStatus)
  @IsNotEmpty()
  status: BugStatus;
}

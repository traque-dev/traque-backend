import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { IssueSeverity } from 'models/types/IssueSeverity';

export class ChangeIssueSeverityDTO {
  @ApiProperty()
  @IsEnum(IssueSeverity)
  @IsNotEmpty()
  severity: IssueSeverity;
}

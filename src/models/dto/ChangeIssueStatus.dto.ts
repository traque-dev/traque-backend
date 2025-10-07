import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { IssueStatus } from 'models/types/IssueStatus';

export class ChangeIssueStatusDTO {
  @ApiProperty()
  @IsEnum(IssueStatus)
  @IsNotEmpty()
  status: IssueStatus;
}

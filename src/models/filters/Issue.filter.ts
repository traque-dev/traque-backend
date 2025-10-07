import { IsEnum, IsOptional } from 'class-validator';

import { IssueSeverity } from 'models/types/IssueSeverity';
import { IssueStatus } from 'models/types/IssueStatus';

export class IssueFilters {
  @IsEnum(IssueStatus)
  @IsOptional()
  status: IssueStatus;

  @IsEnum(IssueSeverity)
  @IsOptional()
  severity: IssueSeverity;
}

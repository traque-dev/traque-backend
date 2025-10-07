import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { IssueSeverity } from 'models/types/IssueSeverity';
import { IssueStatus } from 'models/types/IssueStatus';

export class IssueDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  status: IssueStatus;

  @ApiProperty()
  severity: IssueSeverity;

  @ApiProperty()
  firstSeen: Date;

  @ApiProperty()
  lastSeen: Date;

  @ApiProperty()
  eventCount: number;

  constructor(props: ExtractProps<IssueDTO>) {
    super();

    Object.assign(this, props);
  }
}

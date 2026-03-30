import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { IncidentStatus } from 'models/types/uptime/IncidentStatus';

export class IncidentDTO extends BaseDTO {
  @ApiProperty()
  monitorId: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ enum: IncidentStatus })
  status: IncidentStatus;

  @ApiProperty()
  cause: string;

  @ApiProperty()
  checkedUrl: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  acknowledgedAt?: Date;

  @ApiProperty({ nullable: true })
  acknowledgedById?: string;

  @ApiProperty({ nullable: true })
  resolvedAt?: Date;

  @ApiProperty()
  resolvedAutomatically: boolean;

  constructor(props: ExtractProps<IncidentDTO>) {
    super();

    Object.assign(this, props);
  }
}

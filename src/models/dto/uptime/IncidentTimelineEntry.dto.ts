import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { IncidentTimelineEntryType } from 'models/types/uptime/IncidentTimelineEntryType';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';

export class IncidentTimelineEntryDTO extends BaseDTO {
  @ApiProperty({ enum: IncidentTimelineEntryType })
  type: IncidentTimelineEntryType;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: MonitorRegion, nullable: true })
  region?: MonitorRegion;

  @ApiProperty({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  metadata?: Record<string, any>;

  constructor(props: ExtractProps<IncidentTimelineEntryDTO>) {
    super();

    Object.assign(this, props);
  }
}

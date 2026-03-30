import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityPeriodDTO {
  @ApiProperty()
  label: string;

  @ApiProperty()
  from: Date;

  @ApiProperty()
  to: Date;

  @ApiProperty()
  availabilityPercent: number;

  @ApiProperty()
  downtimeMs: number;

  @ApiProperty()
  incidentCount: number;

  @ApiProperty()
  longestDowntimeMs: number;

  @ApiProperty()
  averageDowntimeMs: number;

  constructor(props: ExtractProps<AvailabilityPeriodDTO>) {
    Object.assign(this, props);
  }
}

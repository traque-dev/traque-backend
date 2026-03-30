import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class MonitorSummaryDTO {
  @ApiProperty({
    nullable: true,
    type: 'number',
    example: 10000,
    description: 'The uptime duration in milliseconds',
  })
  currentlyUpForMs: number | null;

  @ApiProperty({
    nullable: true,
    type: 'string',
    format: 'date-time',
    example: '2026-04-01T12:00:00.000Z',
    description: 'The last check time',
  })
  lastCheckedAt: Date | null;

  constructor(props: ExtractProps<MonitorSummaryDTO>) {
    Object.assign(this, props);
  }
}

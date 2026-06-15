import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class ShortLinkStatsDTO {
  @ApiProperty()
  totalClicks: number;

  @ApiProperty({ description: 'Distinct IP addresses' })
  uniqueVisitors: number;

  @ApiProperty()
  clicksToday: number;

  @ApiProperty()
  clicksLast7Days: number;

  @ApiProperty()
  clicksLast30Days: number;

  @ApiProperty({ nullable: true })
  lastClickedAt?: Date | null;

  constructor(props: ExtractProps<ShortLinkStatsDTO>) {
    Object.assign(this, props);
  }
}

import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { CheckStatus } from 'models/types/uptime/CheckStatus';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';

export class MonitorCheckDTO extends BaseDTO {
  @ApiProperty({ enum: CheckStatus })
  status: CheckStatus;

  @ApiProperty({ enum: MonitorRegion, nullable: true })
  region?: MonitorRegion;

  @ApiProperty()
  checkedAt: Date;

  @ApiProperty({ nullable: true })
  httpStatusCode?: number;

  @ApiProperty({ nullable: true })
  errorMessage?: string;

  @ApiProperty({ nullable: true })
  dnsLookupMs?: number;

  @ApiProperty({ nullable: true })
  tcpConnectionMs?: number;

  @ApiProperty({ nullable: true })
  tlsHandshakeMs?: number;

  @ApiProperty({ nullable: true })
  firstByteMs?: number;

  @ApiProperty({ nullable: true })
  totalResponseMs?: number;

  constructor(props: ExtractProps<MonitorCheckDTO>) {
    super();

    Object.assign(this, props);
  }
}

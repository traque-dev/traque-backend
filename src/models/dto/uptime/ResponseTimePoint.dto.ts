import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class ResponseTimePointDTO {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2026-04-01T12:00:00.000Z',
    description: 'The time of the check',
  })
  checkedAt: Date;

  @ApiProperty({
    nullable: true,
    type: 'number',
    example: 100,
    description: 'The DNS lookup time in milliseconds',
  })
  dnsLookupMs: number | null;

  @ApiProperty({
    nullable: true,
    type: 'number',
    example: 200,
    description: 'The TCP connection time in milliseconds',
  })
  tcpConnectionMs: number | null;

  @ApiProperty({
    nullable: true,
    type: 'number',
    example: 300,
    description: 'The TLS handshake time in milliseconds',
  })
  tlsHandshakeMs: number | null;

  @ApiProperty({
    nullable: true,
    type: 'number',
    example: 400,
    description: 'The total response time in milliseconds',
  })
  totalResponseMs: number | null;

  constructor(props: ExtractProps<ResponseTimePointDTO>) {
    Object.assign(this, props);
  }
}

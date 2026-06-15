import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class ShortLinkTimePointDTO {
  @ApiProperty({ description: 'Bucket start (ISO date)' })
  date: string;

  @ApiProperty()
  clicks: number;

  constructor(props: ExtractProps<ShortLinkTimePointDTO>) {
    Object.assign(this, props);
  }
}

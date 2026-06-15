import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class ShortLinkBreakdownItemDTO {
  @ApiProperty({
    nullable: true,
    description: 'Dimension value (null = unknown)',
  })
  key: string | null;

  @ApiProperty()
  count: number;

  constructor(props: ExtractProps<ShortLinkBreakdownItemDTO>) {
    Object.assign(this, props);
  }
}

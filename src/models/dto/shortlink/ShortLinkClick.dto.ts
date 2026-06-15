import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { ClickDeviceType } from 'models/types/shortlink/ClickDeviceType';

export class ShortLinkClickDTO extends BaseDTO {
  @ApiProperty()
  clickedAt: Date;

  @ApiProperty({ nullable: true })
  country?: string;

  @ApiProperty({ nullable: true })
  region?: string;

  @ApiProperty({ nullable: true })
  city?: string;

  @ApiProperty({ enum: ClickDeviceType })
  deviceType: ClickDeviceType;

  @ApiProperty({ nullable: true })
  browser?: string;

  @ApiProperty({ nullable: true })
  os?: string;

  @ApiProperty({ nullable: true })
  refererDomain?: string;

  @ApiProperty({ nullable: true })
  language?: string;

  @ApiProperty()
  isBot: boolean;

  constructor(props: ExtractProps<ShortLinkClickDTO>) {
    super();

    Object.assign(this, props);
  }
}

import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';

export class IpAddressDTO extends BaseDTO {
  @ApiProperty()
  ip: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  organization: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  timezone: string;

  constructor(props: ExtractProps<IpAddressDTO>) {
    super();

    Object.assign(this, props);
  }
}

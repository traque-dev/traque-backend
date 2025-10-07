import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';

export class OrganizationDTO extends BaseDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  metadata: string;

  constructor(props: ExtractProps<OrganizationDTO>) {
    super();

    Object.assign(this, props);
  }
}

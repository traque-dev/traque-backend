import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';
import { EventPlatform } from 'models/types/EventPlatform';

export class ProjectDTO extends BaseDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsEnum(EventPlatform)
  @IsOptional()
  platform?: EventPlatform;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  apiKey?: string;

  constructor(props: ExtractProps<ProjectDTO>) {
    super();

    Object.assign(this, props);
  }
}

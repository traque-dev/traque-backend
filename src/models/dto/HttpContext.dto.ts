import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';
import { HttpRequestMethod } from 'models/types/HttpRequestMethod';

export class HttpContextDTO extends BaseDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty()
  @IsEnum(HttpRequestMethod)
  @IsOptional()
  method?: HttpRequestMethod;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  statusCode?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  clientIp?: string;

  @ApiProperty()
  @IsOptional()
  response?: unknown;

  constructor(props: ExtractProps<HttpContextDTO>) {
    super();

    Object.assign(this, props);
  }
}

import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';

export class ExceptionFrameDTO extends BaseDTO {
  @ApiProperty()
  @IsOptional()
  @IsInt()
  frameIndex?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  functionName?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  lineNumber?: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  columnNumber?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  absolutePath?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  platform?: string;

  constructor(props: ExtractProps<ExceptionFrameDTO>) {
    super();

    Object.assign(this, props);
  }
}

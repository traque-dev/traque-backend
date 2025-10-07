import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { ExceptionFrameDTO } from './ExceptionFrame.dto';

export class StacktraceDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  stack?: string;

  @ApiProperty({
    type: ExceptionFrameDTO,
    isArray: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExceptionFrameDTO)
  frames?: ExceptionFrameDTO[];

  constructor(props: ExtractProps<StacktraceDTO>) {
    Object.assign(this, props);
  }
}

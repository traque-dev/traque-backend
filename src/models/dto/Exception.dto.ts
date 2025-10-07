import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';
import { HttpContextDTO } from 'models/dto/HttpContext.dto';
import { StacktraceDTO } from 'models/dto/Stacktrace.dto';
import { EventEnvironment } from 'models/types/EventEnvironment';
import { EventPlatform } from 'models/types/EventPlatform';

export class ExceptionDTO extends BaseDTO {
  @ApiProperty()
  @IsEnum(EventEnvironment)
  environment: EventEnvironment;

  @ApiProperty()
  @IsOptional()
  @IsEnum(EventPlatform)
  platform?: EventPlatform;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  suggestion?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => HttpContextDTO)
  @IsOptional()
  httpContext?: HttpContextDTO;

  @ApiProperty()
  @ValidateNested()
  @Type(() => StacktraceDTO)
  @IsOptional()
  stacktrace?: StacktraceDTO;

  constructor(props: ExtractProps<ExceptionDTO>) {
    super();

    Object.assign(this, props);
  }

  withHttpContext(httpContext: HttpContextDTO) {
    this.httpContext = httpContext;

    return this;
  }

  withStacktrace(stacktrace: StacktraceDTO) {
    this.stacktrace = stacktrace;

    return this;
  }
}

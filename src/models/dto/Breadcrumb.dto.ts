import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { BreadcrumbType } from 'models/types/BreadcrumbType';

export class BreadcrumbDTO {
  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty({ enum: BreadcrumbType })
  @IsEnum(BreadcrumbType)
  type: BreadcrumbType;

  @ApiProperty({ required: false, enum: ['debug', 'info', 'warning', 'error'] })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

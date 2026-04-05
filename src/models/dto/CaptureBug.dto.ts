import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { BreadcrumbDTO } from 'models/dto/Breadcrumb.dto';
import { BugBrowserContextDTO } from 'models/dto/BugBrowserContext.dto';
import { BugServerContextDTO } from 'models/dto/BugServerContext.dto';
import { CreateBugReproductionStepDTO } from 'models/dto/CreateBugReproductionStep.dto';
import { BugPriority } from 'models/types/BugPriority';
import { BugSource } from 'models/types/BugSource';

export class CaptureBugDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: BugPriority, required: false })
  @IsEnum(BugPriority)
  @IsOptional()
  priority?: BugPriority;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  expectedBehavior?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  actualBehavior?: string;

  @ApiProperty({ type: [CreateBugReproductionStepDTO], required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateBugReproductionStepDTO)
  @IsArray()
  @IsOptional()
  steps?: CreateBugReproductionStepDTO[];

  @ApiProperty({ type: BugBrowserContextDTO, required: false })
  @ValidateNested()
  @Type(() => BugBrowserContextDTO)
  @IsOptional()
  browserContext?: BugBrowserContextDTO;

  @ApiProperty({ type: BugServerContextDTO, required: false })
  @ValidateNested()
  @Type(() => BugServerContextDTO)
  @IsOptional()
  serverContext?: BugServerContextDTO;

  @ApiProperty({ type: [BreadcrumbDTO], required: false })
  @ValidateNested({ each: true })
  @Type(() => BreadcrumbDTO)
  @IsArray()
  @IsOptional()
  breadcrumbs?: BreadcrumbDTO[];

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  exceptionId?: string;

  @ApiProperty({ required: false })
  @IsEnum(BugSource)
  @IsOptional()
  source?: BugSource;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'IDs of pre-uploaded files to attach',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  fileIds?: string[];
}

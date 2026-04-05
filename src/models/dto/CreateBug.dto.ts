import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { CreateBugReproductionStepDTO } from 'models/dto/CreateBugReproductionStep.dto';
import { BugPriority } from 'models/types/BugPriority';

export class CreateBugDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: BugPriority })
  @IsEnum(BugPriority)
  @IsNotEmpty()
  priority: BugPriority;

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

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  exceptionId?: string;

  @ApiProperty({ type: [CreateBugReproductionStepDTO], required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateBugReproductionStepDTO)
  @IsOptional()
  steps?: CreateBugReproductionStepDTO[];

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

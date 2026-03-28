import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBugDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

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
}

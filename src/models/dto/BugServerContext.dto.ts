import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BugServerContextDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hostname?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  runtime?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  version?: string;
}

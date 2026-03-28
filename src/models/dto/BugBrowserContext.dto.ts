import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ViewportDTO {
  @ApiProperty()
  @IsInt()
  @Min(0)
  width: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  height: number;
}

export class BugBrowserContextDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => ViewportDTO)
  @IsOptional()
  viewport?: ViewportDTO;
}

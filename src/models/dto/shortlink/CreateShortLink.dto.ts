import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateShortLinkDTO {
  @ApiProperty()
  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  destinationUrl: string;

  @ApiProperty({
    required: false,
    description:
      'Custom slug. If omitted a random slug is generated. Allowed: letters, numbers, dashes and underscores.',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'slug may only contain letters, numbers, dashes and underscores',
  })
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false, default: 'traque.app' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  clickLimit?: number;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

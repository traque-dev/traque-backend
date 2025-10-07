import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';
import { SubscriptionSource } from 'models/types/SubscriptionSource';

export class SubscriptionDTO extends BaseDTO {
  @ApiProperty()
  @IsString()
  plan: string;

  @ApiProperty({
    description: 'Internal reference to user or organization',
  })
  @IsString()
  referenceId: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  polarCustomerId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  polarSubscriptionId?: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  periodStart?: Date;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  periodEnd?: Date;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  seats?: number;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  trialStart?: Date;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  trialEnd?: Date;

  @ApiProperty({
    enum: SubscriptionSource,
  })
  @IsEnum(SubscriptionSource)
  source: SubscriptionSource;

  constructor(props: ExtractProps<SubscriptionDTO>) {
    super();

    Object.assign(this, props);
  }
}

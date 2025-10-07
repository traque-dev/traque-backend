import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

import { BaseDTO } from './Base.dto';

export class EventDto extends BaseDTO {
  @ApiProperty({
    description: 'The name of the event',
    type: 'string',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The properties of the event',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  personId?: string;

  constructor(props: ExtractProps<EventDto>) {
    super();

    Object.assign(this, props);
  }
}

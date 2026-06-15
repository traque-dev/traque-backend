import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';

export class ShortLinkDTO extends BaseDTO {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  domain: string;

  @ApiProperty({ description: 'Full short URL (domain + slug)' })
  shortUrl: string;

  @ApiProperty()
  destinationUrl: string;

  @ApiProperty({ nullable: true })
  title?: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true })
  expiresAt?: Date;

  @ApiProperty({ nullable: true })
  clickLimit?: number;

  @ApiProperty()
  clickCount: number;

  @ApiProperty({ nullable: true })
  lastClickedAt?: Date;

  @ApiProperty({ type: 'object', additionalProperties: true })
  metadata?: Record<string, any>;

  constructor(props: ExtractProps<ShortLinkDTO>) {
    super();

    Object.assign(this, props);
  }
}

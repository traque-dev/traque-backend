import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { FileDTO } from 'models/dto/File.dto';
import { FeedbackImpact } from 'models/types/FeedbackImpact';
import { FeedbackPriority } from 'models/types/FeedbackPriority';
import { FeedbackSource } from 'models/types/FeedbackSource';
import { FeedbackStatus } from 'models/types/FeedbackStatus';
import { FeedbackType } from 'models/types/FeedbackType';

export class FeedbackDTO extends BaseDTO {
  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ enum: FeedbackType })
  type: FeedbackType;

  @ApiProperty({ enum: FeedbackStatus })
  status: FeedbackStatus;

  @ApiProperty({ enum: FeedbackPriority })
  priority: FeedbackPriority;

  @ApiProperty({ enum: FeedbackImpact, nullable: true })
  impact?: FeedbackImpact;

  @ApiProperty({ enum: FeedbackSource })
  source: FeedbackSource;

  @ApiProperty({ nullable: true })
  submitterName?: string;

  @ApiProperty({ nullable: true })
  submitterEmail?: string;

  @ApiProperty({ nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ nullable: true })
  reporterId?: string;

  @ApiProperty({ nullable: true })
  reporterName?: string;

  @ApiProperty({ nullable: true })
  assigneeId?: string;

  @ApiProperty({ nullable: true })
  assigneeName?: string;

  @ApiProperty({ type: [FileDTO], nullable: true })
  files?: FileDTO[];

  constructor(props: ExtractProps<FeedbackDTO>) {
    super();

    Object.assign(this, props);
  }
}

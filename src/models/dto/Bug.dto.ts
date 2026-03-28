import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { BugLabelDTO } from 'models/dto/BugLabel.dto';
import { BugReproductionStepDTO } from 'models/dto/BugReproductionStep.dto';
import { BugPriority } from 'models/types/BugPriority';
import { BugSource } from 'models/types/BugSource';
import { BugStatus } from 'models/types/BugStatus';

export class BugDTO extends BaseDTO {
  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ enum: BugStatus })
  status: BugStatus;

  @ApiProperty({ enum: BugPriority })
  priority: BugPriority;

  @ApiProperty({ nullable: true })
  environment?: string;

  @ApiProperty({ nullable: true })
  expectedBehavior?: string;

  @ApiProperty({ nullable: true })
  actualBehavior?: string;

  @ApiProperty({ nullable: true })
  browserContext?: Record<string, any>;

  @ApiProperty({ nullable: true })
  serverContext?: Record<string, any>;

  @ApiProperty({ nullable: true })
  breadcrumbs?: Record<string, any>[];

  @ApiProperty({ nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ enum: BugSource })
  source: BugSource;

  @ApiProperty({ nullable: true })
  reporterId?: string;

  @ApiProperty({ nullable: true })
  reporterName?: string;

  @ApiProperty({ nullable: true })
  assigneeId?: string;

  @ApiProperty({ nullable: true })
  assigneeName?: string;

  @ApiProperty({ nullable: true })
  exceptionId?: string;

  @ApiProperty({ type: [BugLabelDTO], nullable: true })
  labels?: BugLabelDTO[];

  @ApiProperty({ type: [BugReproductionStepDTO], nullable: true })
  steps?: BugReproductionStepDTO[];

  constructor(props: ExtractProps<BugDTO>) {
    super();

    Object.assign(this, props);
  }
}

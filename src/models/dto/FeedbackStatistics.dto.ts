import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class FeedbackStatisticsDTO {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { NEW: 3, UNDER_REVIEW: 1 },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { IDEA: 2, FEATURE_REQUEST: 1 },
  })
  byType: Record<string, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { LOW: 1, MEDIUM: 2, HIGH: 0 },
  })
  byPriority: Record<string, number>;

  constructor(props: ExtractProps<FeedbackStatisticsDTO>) {
    Object.assign(this, props);
  }
}

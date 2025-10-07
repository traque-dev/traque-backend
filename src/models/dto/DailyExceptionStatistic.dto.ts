import { ApiProperty } from '@nestjs/swagger';

export class DailyExceptionStatisticDto {
  @ApiProperty({
    description: 'The date of the exception statistic',
    example: '2025-01-01',
  })
  date: string;

  @ApiProperty({
    description: 'The count of exceptions for the date',
    example: 10,
  })
  count: number;
}

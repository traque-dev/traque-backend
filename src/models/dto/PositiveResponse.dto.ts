import { ApiProperty } from '@nestjs/swagger';

export class PositiveResponseDto {
  @ApiProperty({
    type: 'string',
    example: 'OK',
    description: 'The result of the operation, always "OK"',
  })
  public result = 'OK';

  static instance() {
    return new PositiveResponseDto();
  }
}

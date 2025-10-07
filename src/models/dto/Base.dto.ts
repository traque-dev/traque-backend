import { ApiProperty } from '@nestjs/swagger';

export class BaseDTO {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

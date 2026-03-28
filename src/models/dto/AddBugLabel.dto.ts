import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddBugLabelDTO {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  labelId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBugCommentDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}

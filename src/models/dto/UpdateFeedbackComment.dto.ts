import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFeedbackCommentDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}

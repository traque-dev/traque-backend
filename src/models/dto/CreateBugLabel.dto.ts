import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateBugLabelDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Hex color code (e.g. #ff0000)' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color: string;
}

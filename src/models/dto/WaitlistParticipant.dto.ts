import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class WaitlistParticipantDTO {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

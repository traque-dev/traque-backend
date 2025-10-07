import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApiKeyDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

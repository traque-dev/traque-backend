import { IsNotEmpty, IsString } from 'class-validator';

export class ResendConfig {
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

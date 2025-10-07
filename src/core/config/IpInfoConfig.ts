import { IsNotEmpty, IsString } from 'class-validator';

export class IpInfoConfig {
  @IsString()
  @IsNotEmpty()
  baseURL: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

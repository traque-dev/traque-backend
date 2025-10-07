import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class HttpConfig {
  @IsNotEmpty()
  @IsString()
  baseURL: string;

  @IsNotEmpty()
  @IsNumber()
  port: number;
}

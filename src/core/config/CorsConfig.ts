import { IsArray, IsNotEmpty } from 'class-validator';

export class CorsConfig {
  @IsNotEmpty()
  @IsArray()
  origins: string[];
}

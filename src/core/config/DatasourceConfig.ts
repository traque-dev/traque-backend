import { config } from 'core/config';

import { IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class DatasourceConfig {
  @IsNotEmpty()
  @IsString()
  host: string;

  @IsNotEmpty()
  @IsString()
  database: string;

  @IsNotEmpty()
  @IsNumber()
  port: number;

  @ValidateIf(() => !config.isDevelopment)
  @IsNotEmpty()
  @IsString()
  username: string;

  @ValidateIf(() => !config.isDevelopment)
  @IsNotEmpty()
  @IsString()
  password: string;
}

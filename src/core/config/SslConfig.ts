import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SslConfig {
  @IsBoolean()
  @IsOptional()
  enabled: boolean;

  @IsString()
  @IsOptional()
  keyPath: string;

  @IsString()
  @IsOptional()
  certPath: string;
}

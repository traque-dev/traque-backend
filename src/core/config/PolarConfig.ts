import { IsOptional, IsString } from 'class-validator';

export class PolarConfig {
  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  webhookSecret?: string;

  @IsString()
  @IsOptional()
  plusProductId?: string;
}

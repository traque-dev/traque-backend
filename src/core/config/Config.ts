import { AiConfig } from 'core/config/AiConfig';
import { AppConfig } from 'core/config/AppConfig';
import { ExpoConfig } from 'core/config/ExpoConfig';
import { IpInfoConfig } from 'core/config/IpInfoConfig';
import { OAuthConfig } from 'core/config/OAuthConfig';
import { PolarConfig } from 'core/config/PolarConfig';
import { ResendConfig } from 'core/config/ResendConfig';
import { Mode } from 'core/config/types';

import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class Config {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AppConfig)
  app: AppConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ExpoConfig)
  expo: ExpoConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => IpInfoConfig)
  ipinfo: IpInfoConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OAuthConfig)
  oauth: OAuthConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ResendConfig)
  resend: ResendConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AiConfig)
  ai: AiConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PolarConfig)
  polar: PolarConfig;

  public get isDevelopment() {
    return this.app.mode === Mode.DEVELOPMENT;
  }

  public get isProduction() {
    return this.app.mode === Mode.PRODUCTION;
  }
}

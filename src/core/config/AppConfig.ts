import { EncryptionConfig } from 'core/config/EncryptionConfig';
import { DeploymentMode, Mode } from 'core/config/types';

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { AuthConfig } from './AuthConfig';
import { CorsConfig } from './CorsConfig';
import { DatasourceConfig } from './DatasourceConfig';
import { HttpConfig } from './HttpConfig';
import { JwtConfig } from './JwtConfig';
import { SslConfig } from './SslConfig';

export class AppConfig {
  @IsOptional()
  @IsEnum(Mode)
  mode: Mode;

  @IsOptional()
  @IsEnum(DeploymentMode)
  deploymentMode: DeploymentMode = DeploymentMode.SELF_HOSTED;

  @IsString()
  @IsOptional()
  webAppUrl: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => HttpConfig)
  http: HttpConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DatasourceConfig)
  datasource: DatasourceConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => JwtConfig)
  jwt: JwtConfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => SslConfig)
  ssl?: SslConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EncryptionConfig)
  encryption: EncryptionConfig;

  @ValidateNested()
  @Type(() => CorsConfig)
  cors: CorsConfig;

  @ValidateNested()
  @Type(() => AuthConfig)
  auth: AuthConfig;

  get isSelfHosted() {
    return this.deploymentMode === DeploymentMode.SELF_HOSTED;
  }

  get isTraqueCloud() {
    return this.deploymentMode === DeploymentMode.TRAQUE_CLOUD;
  }
}

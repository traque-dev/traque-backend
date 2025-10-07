import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CrossSubDomainCookies {
  @IsOptional()
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  domain?: string;
}

export class AuthConfig {
  @IsNotEmpty()
  @IsArray()
  trustedOrigins: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CrossSubDomainCookies)
  crossSubDomainCookies?: CrossSubDomainCookies;
}

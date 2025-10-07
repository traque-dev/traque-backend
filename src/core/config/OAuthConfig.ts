import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class GoogleOAuthConfig {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;
}

class AppleOAuthConfig {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;
}

export class OAuthConfig {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => GoogleOAuthConfig)
  google: GoogleOAuthConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AppleOAuthConfig)
  apple: AppleOAuthConfig;
}

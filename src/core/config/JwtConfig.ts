import { IsNotEmpty, IsString } from 'class-validator';

export class JwtConfig {
  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @IsString()
  expiresIn: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class ExpoConfig {
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

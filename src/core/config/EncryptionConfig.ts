import { IsNotEmpty, IsString } from 'class-validator';

export class EncryptionConfig {
  @IsNotEmpty()
  @IsString()
  key: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class S3Config {
  @IsNotEmpty()
  @IsString()
  bucket: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  accessKeyId: string;

  @IsNotEmpty()
  @IsString()
  secretAccessKey: string;

  @IsOptional()
  @IsString()
  endpoint?: string;
}

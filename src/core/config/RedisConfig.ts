import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RedisConfig {
  @IsString()
  host = '127.0.0.1';

  @IsInt()
  @Min(1)
  @Max(65535)
  port = 6379;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsedValue =
      typeof value === 'number' ? value : Number.parseInt(String(value), 10);

    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  })
  db?: number;
}

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class AiVercelConfig {
  @IsNotEmpty()
  @IsString()
  apiKey: string;
}

class AiOpenAIConfig {
  @IsNotEmpty()
  @IsString()
  apiKey: string;
}

export class AiConfig {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AiVercelConfig)
  vercel: AiVercelConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AiOpenAIConfig)
  openai: AiOpenAIConfig;
}

import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AwsWafCredentialsDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  constructor(props: ExtractProps<AwsWafCredentialsDTO>) {
    Object.assign(this, props);
  }
}

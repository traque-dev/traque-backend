import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';

export class PushNotificationTokenDTO extends BaseDTO {
  @ApiProperty()
  @IsString()
  expoPushToken: string;
}

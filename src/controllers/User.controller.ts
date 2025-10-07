import { Session } from 'core/auth/types';
import { AuthenticationPrincipal } from 'core/decorators/AuthenticationPrincipal.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';

import { Body, Controller, Logger, Post, Version } from '@nestjs/common';

import { PushNotificationTokenDTO } from 'models/dto/PushNotificationToken.dto';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { UserService } from 'services/User.service';

@Controller('/users')
export class UserController {
  private readonly logger: Logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Version('1')
  @PreAuthorize()
  @Post('/push-notifications/expo')
  setExpoPushNotificationToken(
    @AuthenticationPrincipal() session: Session,
    @Body() pushNotificationTokenDTO: PushNotificationTokenDTO,
    // TODO: Return PushNotificationTokenDTO
  ): Promise<PushNotificationToken> {
    this.logger.log(`Received set expo push notification token request`);

    return this.userService.setExpoPushNotificationToken(
      session,
      pushNotificationTokenDTO,
    );
  }
}

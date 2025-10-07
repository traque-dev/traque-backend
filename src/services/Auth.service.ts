import { auth } from 'core/auth';

import { Injectable, Logger } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';

import { UserService } from './User.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  public readonly auth: typeof auth;

  constructor(private readonly userService: UserService) {
    this.auth = auth;
  }

  async handleSignOut(req: Request) {
    const sessionResponse = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionResponse) {
      const { session } = sessionResponse;
      await this.userService.deletePushNotificationToken(session.id);

      this.logger.log(
        `Deleted Push Token for Session: sessionId=${session.id}, userId=${session.userId}`,
      );
    }
  }

  async handleDeleteUser(req: Request) {
    const sessionResponse = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionResponse) {
      const { session } = sessionResponse;
      await this.userService.deletePushNotificationToken(session.id);

      this.logger.log(
        `Deleted Push Token for Session: sessionId=${session.id}, userId=${session.userId}`,
      );
    }
  }
}

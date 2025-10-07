import { Session } from 'core/auth/types';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PushNotificationTokenDTO } from 'models/dto/PushNotificationToken.dto';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(PushNotificationToken)
    private readonly pushNotificationTokenRepo: Repository<PushNotificationToken>,
  ) {}

  public async setExpoPushNotificationToken(
    { session }: Session,
    { expoPushToken }: PushNotificationTokenDTO,
  ): Promise<PushNotificationToken> {
    const existingPushToken = await this.pushNotificationTokenRepo.findOne({
      where: {
        session: {
          id: session.id,
        },
      },
    });

    if (existingPushToken) {
      return existingPushToken;
    }

    const token = new PushNotificationToken({
      expoPushToken,
    }).setSessionId(session.id);

    return this.pushNotificationTokenRepo.save(token);
  }

  public async deletePushNotificationToken(
    sessionId: Session['session']['id'],
  ) {
    await this.pushNotificationTokenRepo.delete({
      session: {
        id: sessionId,
      },
    });
  }
}

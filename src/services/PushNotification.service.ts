import { config } from 'core/config';

import { Injectable } from '@nestjs/common';
import {
  Expo as ExpoClient,
  ExpoPushMessage,
  ExpoPushTicket,
} from 'expo-server-sdk';

@Injectable()
export class PushNotificationService {
  private readonly expoClient = new ExpoClient({
    accessToken: config.expo.accessToken,
  });

  sendPushNotifications(
    messages: ExpoPushMessage[],
  ): Promise<ExpoPushTicket[]> {
    return this.expoClient.sendPushNotificationsAsync(messages);
  }
}

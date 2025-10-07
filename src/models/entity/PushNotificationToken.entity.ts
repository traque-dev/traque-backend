import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Session } from 'models/entity/Session.entity';

type PushNotificationTokenConstructorParams = Omit<
  ExtractEntityProps<PushNotificationToken>,
  'session'
>;

@Entity({
  name: 'push_notification_tokens',
})
export class PushNotificationToken extends BaseEntity {
  @OneToOne(() => Session)
  @JoinColumn({
    name: 'session_id',
  })
  session: Session;

  @Column({
    name: 'expo_push_token',
    type: 'text',
  })
  expoPushToken: string;

  constructor(props: PushNotificationTokenConstructorParams) {
    super();

    Object.assign(this, props);
  }

  setSessionId(sessionId: Session['id']) {
    if (!this.session) {
      // @ts-expect-error we don't need whole Session object, only ID
      this.session = {};
    }

    this.session.id = sessionId;

    return this;
  }
}

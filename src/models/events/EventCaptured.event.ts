import { ExtractProps } from 'core/types/ExtractProps';

import { Event } from 'models/entity/Event.entity';

export class EventCapturedEvent {
  public static readonly eventName = 'event.captured';

  public readonly event: Event;

  constructor(props: ExtractProps<EventCapturedEvent>) {
    Object.assign(this, props);
  }
}

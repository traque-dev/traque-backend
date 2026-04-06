import { ExtractProps } from 'core/types/ExtractProps';

import { Feedback } from 'models/entity/Feedback.entity';

export class FeedbackCreatedEvent {
  public static readonly eventName = 'feedback.created';

  public readonly feedback: Feedback;

  constructor(props: ExtractProps<FeedbackCreatedEvent>) {
    Object.assign(this, props);
  }
}

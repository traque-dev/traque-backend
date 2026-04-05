import { ExtractProps } from 'core/types/ExtractProps';

import { Bug } from 'models/entity/Bug.entity';

export class BugCreatedEvent {
  public static readonly eventName = 'bug.created';

  public readonly bug: Bug;

  constructor(props: ExtractProps<BugCreatedEvent>) {
    Object.assign(this, props);
  }
}

import { ExtractProps } from 'core/types/ExtractProps';

import { Exception } from 'models/entity/Exception.entity';

export class ExceptionCreatedEvent {
  public static readonly eventName = 'exception.created';

  public readonly exception: Exception;

  constructor(props: ExtractProps<ExceptionCreatedEvent>) {
    Object.assign(this, props);
  }
}

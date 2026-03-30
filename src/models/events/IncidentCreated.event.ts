import { ExtractProps } from 'core/types/ExtractProps';

import { Incident } from 'models/entity/uptime/Incident.entity';

export class IncidentCreatedEvent {
  public static readonly eventName = 'uptime.incident.created';

  public readonly incident: Incident;

  constructor(props: ExtractProps<IncidentCreatedEvent>) {
    Object.assign(this, props);
  }
}

import { ExtractProps } from 'core/types/ExtractProps';

import { Incident } from 'models/entity/uptime/Incident.entity';

export class IncidentResolvedEvent {
  public static readonly eventName = 'uptime.incident.resolved';

  public readonly incident: Incident;

  constructor(props: ExtractProps<IncidentResolvedEvent>) {
    Object.assign(this, props);
  }
}

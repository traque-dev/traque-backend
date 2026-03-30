import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { IncidentStatus } from 'models/types/uptime/IncidentStatus';

export class IncidentFilters {
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @IsUUID()
  @IsOptional()
  monitorId?: string;
}

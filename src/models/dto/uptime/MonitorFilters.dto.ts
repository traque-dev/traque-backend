import { IsEnum, IsOptional, IsString } from 'class-validator';

import { MonitorStatus } from 'models/types/uptime/MonitorStatus';
import { MonitorType } from 'models/types/uptime/MonitorType';

export class MonitorFilters {
  @IsEnum(MonitorStatus)
  @IsOptional()
  status?: MonitorStatus;

  @IsEnum(MonitorType)
  @IsOptional()
  type?: MonitorType;

  @IsString()
  @IsOptional()
  search?: string;
}

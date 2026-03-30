import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

import { BaseDTO } from 'models/dto/Base.dto';
import { EscalationPolicy } from 'models/types/uptime/EscalationPolicy';
import { HttpMethod } from 'models/types/uptime/HttpMethod';
import { IpVersion } from 'models/types/uptime/IpVersion';
import { MaintenanceDay } from 'models/types/uptime/MaintenanceDay';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';
import { MonitorStatus } from 'models/types/uptime/MonitorStatus';
import { MonitorType } from 'models/types/uptime/MonitorType';
import { NotificationChannel } from 'models/types/uptime/NotificationChannel';

export class MonitorDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  pronounceableName?: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: MonitorType })
  type: MonitorType;

  @ApiProperty({ enum: MonitorStatus })
  status: MonitorStatus;

  @ApiProperty()
  checkIntervalSeconds: number;

  @ApiProperty()
  confirmationPeriodSeconds: number;

  @ApiProperty()
  recoveryPeriodSeconds: number;

  @ApiProperty()
  requestTimeoutSeconds: number;

  @ApiProperty({ nullable: true })
  lastCheckedAt?: Date;

  @ApiProperty({ enum: HttpMethod })
  httpMethod: HttpMethod;

  @ApiProperty({ nullable: true })
  requestBody?: string;

  @ApiProperty({ nullable: true, type: 'array', items: { type: 'object' } })
  requestHeaders?: { name: string; value: string }[];

  @ApiProperty()
  followRedirects: boolean;

  @ApiProperty()
  keepCookiesOnRedirect: boolean;

  @ApiProperty({ nullable: true })
  basicAuthUsername?: string;

  @ApiProperty({ nullable: true })
  basicAuthPassword?: string;

  @ApiProperty({ nullable: true })
  proxyHost?: string;

  @ApiProperty({ nullable: true })
  proxyPort?: number;

  @ApiProperty({ nullable: true })
  keyword?: string;

  @ApiProperty({ nullable: true })
  expectedStatusCode?: number;

  @ApiProperty({ nullable: true })
  port?: number;

  @ApiProperty({ enum: IpVersion })
  ipVersion: IpVersion;

  @ApiProperty({ enum: MonitorRegion, isArray: true })
  regions: MonitorRegion[];

  @ApiProperty()
  sslVerification: boolean;

  @ApiProperty({ nullable: true })
  sslExpirationAlertDays?: number;

  @ApiProperty({ nullable: true })
  domainExpirationAlertDays?: number;

  @ApiProperty({ nullable: true })
  maintenanceWindowStartTime?: string;

  @ApiProperty({ nullable: true })
  maintenanceWindowEndTime?: string;

  @ApiProperty({ nullable: true })
  maintenanceWindowTimezone?: string;

  @ApiProperty({ enum: MaintenanceDay, isArray: true, nullable: true })
  maintenanceWindowDays?: MaintenanceDay[];

  @ApiProperty({ enum: NotificationChannel, isArray: true })
  notificationChannels: NotificationChannel[];

  @ApiProperty({ enum: EscalationPolicy })
  escalationPolicy: EscalationPolicy;

  constructor(props: ExtractProps<MonitorDTO>) {
    super();

    Object.assign(this, props);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { EscalationPolicy } from 'models/types/uptime/EscalationPolicy';
import { HttpMethod } from 'models/types/uptime/HttpMethod';
import { IpVersion } from 'models/types/uptime/IpVersion';
import { MaintenanceDay } from 'models/types/uptime/MaintenanceDay';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';
import { MonitorType } from 'models/types/uptime/MonitorType';
import { NotificationChannel } from 'models/types/uptime/NotificationChannel';

export class RequestHeaderDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateMonitorDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pronounceableName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ enum: MonitorType })
  @IsEnum(MonitorType)
  type: MonitorType;

  // -- Timing --

  @ApiProperty({ required: false, default: 180 })
  @IsInt()
  @Min(30)
  @Max(86400)
  @IsOptional()
  checkIntervalSeconds?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  confirmationPeriodSeconds?: number;

  @ApiProperty({ required: false, default: 180 })
  @IsInt()
  @Min(0)
  @IsOptional()
  recoveryPeriodSeconds?: number;

  @ApiProperty({ required: false, default: 30 })
  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  requestTimeoutSeconds?: number;

  // -- HTTP Request config --

  @ApiProperty({ enum: HttpMethod, required: false, default: HttpMethod.GET })
  @IsEnum(HttpMethod)
  @IsOptional()
  httpMethod?: HttpMethod;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  requestBody?: string;

  @ApiProperty({ type: [RequestHeaderDTO], required: false })
  @ValidateNested({ each: true })
  @Type(() => RequestHeaderDTO)
  @IsArray()
  @IsOptional()
  requestHeaders?: RequestHeaderDTO[];

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  followRedirects?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  keepCookiesOnRedirect?: boolean;

  // -- HTTP Authentication --

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  basicAuthUsername?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  basicAuthPassword?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  proxyHost?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  proxyPort?: number;

  // -- Alert condition config --

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(100)
  @Max(599)
  @IsOptional()
  expectedStatusCode?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  // -- Network --

  @ApiProperty({ enum: IpVersion, required: false, default: IpVersion.BOTH })
  @IsEnum(IpVersion)
  @IsOptional()
  ipVersion?: IpVersion;

  @ApiProperty({ enum: MonitorRegion, isArray: true, required: false })
  @IsEnum(MonitorRegion, { each: true })
  @IsArray()
  @IsOptional()
  regions?: MonitorRegion[];

  // -- SSL & Domain --

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  sslVerification?: boolean;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  sslExpirationAlertDays?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  domainExpirationAlertDays?: number;

  // -- Maintenance window --

  @ApiProperty({ required: false, description: 'HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsOptional()
  maintenanceWindowStartTime?: string;

  @ApiProperty({ required: false, description: 'HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsOptional()
  maintenanceWindowEndTime?: string;

  @ApiProperty({ required: false, description: 'IANA timezone' })
  @IsString()
  @IsOptional()
  maintenanceWindowTimezone?: string;

  @ApiProperty({ enum: MaintenanceDay, isArray: true, required: false })
  @IsEnum(MaintenanceDay, { each: true })
  @IsArray()
  @IsOptional()
  maintenanceWindowDays?: MaintenanceDay[];

  // -- Escalation --

  @ApiProperty({
    enum: NotificationChannel,
    isArray: true,
    required: false,
    default: [NotificationChannel.EMAIL],
  })
  @IsEnum(NotificationChannel, { each: true })
  @IsArray()
  @IsOptional()
  notificationChannels?: NotificationChannel[];

  @ApiProperty({
    enum: EscalationPolicy,
    required: false,
    default: EscalationPolicy.IMMEDIATELY,
  })
  @IsEnum(EscalationPolicy)
  @IsOptional()
  escalationPolicy?: EscalationPolicy;
}

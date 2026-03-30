import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Organization } from 'models/entity/Organization.entity';
import { EscalationPolicy } from 'models/types/uptime/EscalationPolicy';
import { HttpMethod } from 'models/types/uptime/HttpMethod';
import { IpVersion } from 'models/types/uptime/IpVersion';
import { MaintenanceDay } from 'models/types/uptime/MaintenanceDay';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';
import { MonitorStatus } from 'models/types/uptime/MonitorStatus';
import { MonitorType } from 'models/types/uptime/MonitorType';
import { NotificationChannel } from 'models/types/uptime/NotificationChannel';

type MonitorConstructorParams = Omit<
  ExtractEntityProps<Monitor>,
  'organization'
>;

@Entity({ name: 'uptime_monitors' })
@Index(['organization'])
export class Monitor extends BaseEntity {
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'pronounceable_name', type: 'text', nullable: true })
  pronounceableName?: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'enum', enum: MonitorType })
  type: MonitorType;

  @Column({
    type: 'enum',
    enum: MonitorStatus,
    default: MonitorStatus.PENDING,
  })
  status: MonitorStatus;

  // -- Timing --

  @Column({
    name: 'check_interval_seconds',
    type: 'int',
    default: 180,
  })
  checkIntervalSeconds: number;

  @Column({
    name: 'confirmation_period_seconds',
    type: 'int',
    default: 0,
  })
  confirmationPeriodSeconds: number;

  @Column({
    name: 'recovery_period_seconds',
    type: 'int',
    default: 180,
  })
  recoveryPeriodSeconds: number;

  @Column({
    name: 'request_timeout_seconds',
    type: 'int',
    default: 30,
  })
  requestTimeoutSeconds: number;

  @Column({
    name: 'last_checked_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastCheckedAt?: Date;

  // -- HTTP Request config --

  @Column({
    name: 'http_method',
    type: 'enum',
    enum: HttpMethod,
    default: HttpMethod.GET,
  })
  httpMethod: HttpMethod;

  @Column({ name: 'request_body', type: 'text', nullable: true })
  requestBody?: string;

  @Column({
    name: 'request_headers',
    type: 'jsonb',
    nullable: true,
  })
  requestHeaders?: { name: string; value: string }[];

  @Column({
    name: 'follow_redirects',
    type: 'boolean',
    default: true,
  })
  followRedirects: boolean;

  @Column({
    name: 'keep_cookies_on_redirect',
    type: 'boolean',
    default: true,
  })
  keepCookiesOnRedirect: boolean;

  // -- HTTP Authentication --

  @Column({
    name: 'basic_auth_username',
    type: 'text',
    nullable: true,
  })
  basicAuthUsername?: string;

  @Column({
    name: 'basic_auth_password',
    type: 'text',
    nullable: true,
  })
  basicAuthPassword?: string;

  @Column({ name: 'proxy_host', type: 'text', nullable: true })
  proxyHost?: string;

  @Column({ name: 'proxy_port', type: 'int', nullable: true })
  proxyPort?: number;

  // -- Alert condition config --

  @Column({ type: 'text', nullable: true })
  keyword?: string;

  @Column({
    name: 'expected_status_code',
    type: 'int',
    nullable: true,
  })
  expectedStatusCode?: number;

  @Column({ type: 'int', nullable: true })
  port?: number;

  // -- Network --

  @Column({
    name: 'ip_version',
    type: 'enum',
    enum: IpVersion,
    default: IpVersion.BOTH,
  })
  ipVersion: IpVersion;

  @Column({
    type: 'enum',
    enum: MonitorRegion,
    array: true,
    default: [
      MonitorRegion.EUROPE,
      MonitorRegion.NORTH_AMERICA,
      MonitorRegion.ASIA,
      MonitorRegion.AUSTRALIA,
    ],
  })
  regions: MonitorRegion[];

  // -- SSL & Domain --

  @Column({
    name: 'ssl_verification',
    type: 'boolean',
    default: true,
  })
  sslVerification: boolean;

  @Column({
    name: 'ssl_expiration_alert_days',
    type: 'int',
    nullable: true,
  })
  sslExpirationAlertDays?: number;

  @Column({
    name: 'domain_expiration_alert_days',
    type: 'int',
    nullable: true,
  })
  domainExpirationAlertDays?: number;

  // -- Maintenance window --

  @Column({
    name: 'maintenance_window_start_time',
    type: 'text',
    nullable: true,
  })
  maintenanceWindowStartTime?: string;

  @Column({
    name: 'maintenance_window_end_time',
    type: 'text',
    nullable: true,
  })
  maintenanceWindowEndTime?: string;

  @Column({
    name: 'maintenance_window_timezone',
    type: 'text',
    nullable: true,
  })
  maintenanceWindowTimezone?: string;

  @Column({
    name: 'maintenance_window_days',
    type: 'enum',
    enum: MaintenanceDay,
    array: true,
    nullable: true,
  })
  maintenanceWindowDays?: MaintenanceDay[];

  // -- Escalation --

  @Column({
    name: 'notification_channels',
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.EMAIL],
  })
  notificationChannels: NotificationChannel[];

  @Column({
    name: 'escalation_policy',
    type: 'enum',
    enum: EscalationPolicy,
    default: EscalationPolicy.IMMEDIATELY,
  })
  escalationPolicy: EscalationPolicy;

  constructor(props: MonitorConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

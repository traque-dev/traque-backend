import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { CheckStatus } from 'models/types/uptime/CheckStatus';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';

type MonitorCheckConstructorParams = Omit<
  ExtractEntityProps<MonitorCheck>,
  'monitor'
>;

@Entity({ name: 'uptime_monitor_checks' })
@Index(['monitor', 'checkedAt'])
@Index(['monitor', 'region', 'checkedAt'])
export class MonitorCheck extends BaseEntity {
  @ManyToOne(() => Monitor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'monitor_id' })
  monitor: Monitor;

  @Column({ type: 'enum', enum: CheckStatus })
  status: CheckStatus;

  @Column({
    type: 'enum',
    enum: MonitorRegion,
    nullable: true,
  })
  region?: MonitorRegion;

  @Column({
    name: 'checked_at',
    type: 'timestamptz',
  })
  checkedAt: Date;

  @Column({
    name: 'http_status_code',
    type: 'int',
    nullable: true,
  })
  httpStatusCode?: number;

  @Column({
    name: 'error_message',
    type: 'text',
    nullable: true,
  })
  errorMessage?: string;

  // -- Granular timing (ms) --

  @Column({
    name: 'dns_lookup_ms',
    type: 'int',
    nullable: true,
  })
  dnsLookupMs?: number;

  @Column({
    name: 'tcp_connection_ms',
    type: 'int',
    nullable: true,
  })
  tcpConnectionMs?: number;

  @Column({
    name: 'tls_handshake_ms',
    type: 'int',
    nullable: true,
  })
  tlsHandshakeMs?: number;

  @Column({
    name: 'first_byte_ms',
    type: 'int',
    nullable: true,
  })
  firstByteMs?: number;

  @Column({
    name: 'total_response_ms',
    type: 'int',
    nullable: true,
  })
  totalResponseMs?: number;

  constructor(props: MonitorCheckConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

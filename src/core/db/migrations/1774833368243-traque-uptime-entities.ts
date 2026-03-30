import { MigrationInterface, QueryRunner } from 'typeorm';

export class TraqueUptimeEntities1774833368243 implements MigrationInterface {
  name = 'TraqueUptimeEntities1774833368243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_incident_timeline_entries_type_enum" AS ENUM('CHECK_FAILED', 'INCIDENT_STARTED', 'NOTIFICATION_SENT', 'MONITOR_RECOVERED', 'WAITING_FOR_RECOVERY', 'INCIDENT_RESOLVED', 'INCIDENT_ACKNOWLEDGED', 'COMMENT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_incident_timeline_entries_region_enum" AS ENUM('EUROPE', 'NORTH_AMERICA', 'ASIA', 'AUSTRALIA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "uptime_incident_timeline_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."uptime_incident_timeline_entries_type_enum" NOT NULL, "message" text NOT NULL, "region" "public"."uptime_incident_timeline_entries_region_enum", "metadata" jsonb, "incident_id" uuid, CONSTRAINT "PK_dc6dfb9634d2065e461e05f6461" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_type_enum" AS ENUM('HTTP_UNAVAILABLE', 'HTTP_KEYWORD_MISSING', 'HTTP_KEYWORD_PRESENT', 'HTTP_STATUS_CODE', 'PING', 'TCP', 'UDP', 'SMTP', 'POP3', 'IMAP', 'DNS', 'PLAYWRIGHT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_status_enum" AS ENUM('UP', 'DOWN', 'PAUSED', 'PENDING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_http_method_enum" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_ip_version_enum" AS ENUM('IPV4', 'IPV6', 'BOTH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_regions_enum" AS ENUM('EUROPE', 'NORTH_AMERICA', 'ASIA', 'AUSTRALIA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_maintenance_window_days_enum" AS ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_notification_channels_enum" AS ENUM('CALL', 'SMS', 'EMAIL', 'PUSH', 'CRITICAL_ALERT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitors_escalation_policy_enum" AS ENUM('DO_NOTHING', 'IMMEDIATELY', 'WITHIN_3_MIN', 'WITHIN_5_MIN', 'WITHIN_10_MIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "uptime_monitors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "pronounceable_name" text, "url" text NOT NULL, "type" "public"."uptime_monitors_type_enum" NOT NULL, "status" "public"."uptime_monitors_status_enum" NOT NULL DEFAULT 'PENDING', "check_interval_seconds" integer NOT NULL DEFAULT '180', "confirmation_period_seconds" integer NOT NULL DEFAULT '0', "recovery_period_seconds" integer NOT NULL DEFAULT '180', "request_timeout_seconds" integer NOT NULL DEFAULT '30', "last_checked_at" TIMESTAMP WITH TIME ZONE, "http_method" "public"."uptime_monitors_http_method_enum" NOT NULL DEFAULT 'GET', "request_body" text, "request_headers" jsonb, "follow_redirects" boolean NOT NULL DEFAULT true, "keep_cookies_on_redirect" boolean NOT NULL DEFAULT true, "basic_auth_username" text, "basic_auth_password" text, "proxy_host" text, "proxy_port" integer, "keyword" text, "expected_status_code" integer, "port" integer, "ip_version" "public"."uptime_monitors_ip_version_enum" NOT NULL DEFAULT 'BOTH', "regions" "public"."uptime_monitors_regions_enum" array NOT NULL DEFAULT '{EUROPE,NORTH_AMERICA,ASIA,AUSTRALIA}', "ssl_verification" boolean NOT NULL DEFAULT true, "ssl_expiration_alert_days" integer, "domain_expiration_alert_days" integer, "maintenance_window_start_time" text, "maintenance_window_end_time" text, "maintenance_window_timezone" text, "maintenance_window_days" "public"."uptime_monitors_maintenance_window_days_enum" array, "notification_channels" "public"."uptime_monitors_notification_channels_enum" array NOT NULL DEFAULT '{EMAIL}', "escalation_policy" "public"."uptime_monitors_escalation_policy_enum" NOT NULL DEFAULT 'IMMEDIATELY', "organization_id" uuid, CONSTRAINT "PK_79cf7402c31e7ad0d5797ffd34d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a9d49702fc3cdf01c34d5b920" ON "uptime_monitors" ("organization_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_incidents_status_enum" AS ENUM('STARTED', 'ACKNOWLEDGED', 'RESOLVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "uptime_incidents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."uptime_incidents_status_enum" NOT NULL, "cause" text NOT NULL, "checked_url" text NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "acknowledged_at" TIMESTAMP WITH TIME ZONE, "resolved_at" TIMESTAMP WITH TIME ZONE, "resolved_automatically" boolean NOT NULL DEFAULT false, "monitor_id" uuid, "organization_id" uuid, "acknowledged_by_id" uuid, CONSTRAINT "PK_148decbcd1544a698770a35115e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1050e402f371ea8d81fc3d267f" ON "uptime_incidents" ("monitor_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09172aaafb95c8148adeefb943" ON "uptime_incidents" ("organization_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitor_checks_status_enum" AS ENUM('UP', 'DOWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."uptime_monitor_checks_region_enum" AS ENUM('EUROPE', 'NORTH_AMERICA', 'ASIA', 'AUSTRALIA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "uptime_monitor_checks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."uptime_monitor_checks_status_enum" NOT NULL, "region" "public"."uptime_monitor_checks_region_enum", "checked_at" TIMESTAMP WITH TIME ZONE NOT NULL, "http_status_code" integer, "error_message" text, "dns_lookup_ms" integer, "tcp_connection_ms" integer, "tls_handshake_ms" integer, "first_byte_ms" integer, "total_response_ms" integer, "monitor_id" uuid, CONSTRAINT "PK_2cf57725d1ffb9e8ad4cfe653c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3ed7b576b3246cb303f411efb" ON "uptime_monitor_checks" ("monitor_id", "region", "checked_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71d4d720701ea28da54b851827" ON "uptime_monitor_checks" ("monitor_id", "checked_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incident_timeline_entries" ADD CONSTRAINT "FK_d2a78fdf790eae4522a6bab7002" FOREIGN KEY ("incident_id") REFERENCES "uptime_incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_monitors" ADD CONSTRAINT "FK_8a9d49702fc3cdf01c34d5b9205" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incidents" ADD CONSTRAINT "FK_c427f36bd99835831215610abb0" FOREIGN KEY ("monitor_id") REFERENCES "uptime_monitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incidents" ADD CONSTRAINT "FK_09172aaafb95c8148adeefb9431" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incidents" ADD CONSTRAINT "FK_6d4906906c6bb8b0a6763ed8d3c" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_monitor_checks" ADD CONSTRAINT "FK_f4a50863a9c363f5e1a2c29cc0b" FOREIGN KEY ("monitor_id") REFERENCES "uptime_monitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "uptime_monitor_checks" DROP CONSTRAINT "FK_f4a50863a9c363f5e1a2c29cc0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incidents" DROP CONSTRAINT "FK_6d4906906c6bb8b0a6763ed8d3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incidents" DROP CONSTRAINT "FK_09172aaafb95c8148adeefb9431"`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incidents" DROP CONSTRAINT "FK_c427f36bd99835831215610abb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_monitors" DROP CONSTRAINT "FK_8a9d49702fc3cdf01c34d5b9205"`,
    );
    await queryRunner.query(
      `ALTER TABLE "uptime_incident_timeline_entries" DROP CONSTRAINT "FK_d2a78fdf790eae4522a6bab7002"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71d4d720701ea28da54b851827"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3ed7b576b3246cb303f411efb"`,
    );
    await queryRunner.query(`DROP TABLE "uptime_monitor_checks"`);
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitor_checks_region_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitor_checks_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09172aaafb95c8148adeefb943"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1050e402f371ea8d81fc3d267f"`,
    );
    await queryRunner.query(`DROP TABLE "uptime_incidents"`);
    await queryRunner.query(
      `DROP TYPE "public"."uptime_incidents_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a9d49702fc3cdf01c34d5b920"`,
    );
    await queryRunner.query(`DROP TABLE "uptime_monitors"`);
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitors_escalation_policy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitors_notification_channels_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitors_maintenance_window_days_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitors_regions_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitors_ip_version_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_monitors_http_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."uptime_monitors_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."uptime_monitors_type_enum"`);
    await queryRunner.query(`DROP TABLE "uptime_incident_timeline_entries"`);
    await queryRunner.query(
      `DROP TYPE "public"."uptime_incident_timeline_entries_region_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."uptime_incident_timeline_entries_type_enum"`,
    );
  }
}

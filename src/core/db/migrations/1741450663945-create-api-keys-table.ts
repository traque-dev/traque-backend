import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeysTable1741450663945 implements MigrationInterface {
  name = 'CreateApiKeysTable1741450663945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text, "start" text, "prefix" text, "key" text NOT NULL, "refill_interval" bigint, "refill_amount" bigint, "last_refill_at" TIMESTAMP WITH TIME ZONE, "enabled" boolean NOT NULL, "rate_limit_enabled" boolean NOT NULL, "rate_limit_time_window" integer, "rate_limit_max" bigint, "request_count" bigint NOT NULL, "remaining" bigint, "last_request" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "permissions" text, "metadata" jsonb, "user_id" uuid, CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_a3baee01d8408cd3c0f89a9a973" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_keys" DROP CONSTRAINT "FK_a3baee01d8408cd3c0f89a9a973"`,
    );
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}

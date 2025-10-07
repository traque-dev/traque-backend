import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIpAddressesTable1739814806133 implements MigrationInterface {
  name = 'AddIpAddressesTable1739814806133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ip_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ip" text NOT NULL, "city" text, "region" text, "country" text, "location" text, "organization" text, "postalCode" text, "timezone" text, CONSTRAINT "UQ_4c3f105c441f01f175fb08b8613" UNIQUE ("ip"), CONSTRAINT "PK_cd79a3bbf0f74921615b60f6266" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ip_addresses"`);
  }
}

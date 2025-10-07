import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTwoFactorTable1737998615374 implements MigrationInterface {
  name = 'CreateTwoFactorTable1737998615374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "two_factor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "secret" text NOT NULL, "backup_codes" text NOT NULL, "user_id" uuid, CONSTRAINT "REL_162c7f53b41b84102a8e06eff1" UNIQUE ("user_id"), CONSTRAINT "PK_d9e707ebc943c110fcaab7cdd8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "two_factor_enabled" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "FK_162c7f53b41b84102a8e06eff18" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "FK_162c7f53b41b84102a8e06eff18"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "two_factor_enabled"`,
    );
    await queryRunner.query(`DROP TABLE "two_factor"`);
  }
}

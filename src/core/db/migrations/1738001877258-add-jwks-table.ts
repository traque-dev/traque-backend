import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJwksTable1738001877258 implements MigrationInterface {
  name = 'AddJwksTable1738001877258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "jwks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "public_key" character varying NOT NULL, "private_key" character varying NOT NULL, CONSTRAINT "PK_147086b49bf8366682d1a7ca7c1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "jwks"`);
  }
}

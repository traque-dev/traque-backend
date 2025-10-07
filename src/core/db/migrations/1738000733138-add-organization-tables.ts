import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationTables1738000733138 implements MigrationInterface {
  name = 'AddOrganizationTables1738000733138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "slug" text NOT NULL, "logo" text, "metadata" text, CONSTRAINT "UQ_963693341bd612aa01ddf3a4b68" UNIQUE ("slug"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role" text NOT NULL, "organization_id" uuid, "user_id" uuid, CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" text NOT NULL, "role" text, "status" text NOT NULL, "expires_at" TIMESTAMP NOT NULL, "organization_id" uuid, "inviter_id" uuid, CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "active_organization_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_40c051286e8db5b4613ecb3035a" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_40c051286e8db5b4613ecb3035a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "active_organization_id"`,
    );
    await queryRunner.query(`DROP TABLE "invitations"`);
    await queryRunner.query(`DROP TABLE "members"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
  }
}

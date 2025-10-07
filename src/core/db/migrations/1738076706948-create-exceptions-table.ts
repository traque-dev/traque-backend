import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExceptionsTable1738076706948 implements MigrationInterface {
  name = 'CreateExceptionsTable1738076706948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."exceptions_environment_enum" AS ENUM('PRODUCTION', 'STAGING', 'DEVELOPMENT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exceptions_platform_enum" AS ENUM('NEST_JS', 'NODE_JS', 'JAVA', 'PYTHON')`,
    );
    await queryRunner.query(
      `CREATE TABLE "exceptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "environment" "public"."exceptions_environment_enum" NOT NULL, "platform" "public"."exceptions_platform_enum" NOT NULL, "name" character varying NOT NULL, "message" character varying NOT NULL, "details" character varying, "suggestion" character varying, "issue_id" uuid, "project_id" uuid, CONSTRAINT "PK_30e436ef146011cd8a1a758069c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ADD CONSTRAINT "FK_7c7aad102d4d6714eec93a84ae6" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ADD CONSTRAINT "FK_afab4d7801bfec0a906d0314a5b" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exceptions" DROP CONSTRAINT "FK_afab4d7801bfec0a906d0314a5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" DROP CONSTRAINT "FK_7c7aad102d4d6714eec93a84ae6"`,
    );
    await queryRunner.query(`DROP TABLE "exceptions"`);
    await queryRunner.query(`DROP TYPE "public"."exceptions_platform_enum"`);
    await queryRunner.query(`DROP TYPE "public"."exceptions_environment_enum"`);
  }
}

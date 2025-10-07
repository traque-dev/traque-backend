import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectTables1738074310679 implements MigrationInterface {
  name = 'CreateProjectTables1738074310679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "description" text, "api_key" text NOT NULL, "organization_id" uuid, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."issues_status_enum" AS ENUM('OPEN', 'RESOLVED', 'IGNORED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."issues_severity_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "issues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "status" "public"."issues_status_enum" NOT NULL, "severity" "public"."issues_severity_enum" NOT NULL, "firstSeen" TIMESTAMP NOT NULL, "lastSeen" TIMESTAMP NOT NULL, "eventCount" bigint NOT NULL, "project_id" uuid, CONSTRAINT "PK_9d8ecbbeff46229c700f0449257" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_585c8ce06628c70b70100bfb842" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_11f35e8296e10c229e7b68c68d4" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issues" DROP CONSTRAINT "FK_11f35e8296e10c229e7b68c68d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_585c8ce06628c70b70100bfb842"`,
    );
    await queryRunner.query(`DROP TABLE "issues"`);
    await queryRunner.query(`DROP TYPE "public"."issues_severity_enum"`);
    await queryRunner.query(`DROP TYPE "public"."issues_status_enum"`);
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}

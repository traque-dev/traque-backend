import { MigrationInterface, QueryRunner } from 'typeorm';

export class BugReporting1774724334478 implements MigrationInterface {
  name = 'BugReporting1774724334478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."bug_activities_type_enum" AS ENUM('STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNEE_CHANGED', 'LABEL_ADDED', 'LABEL_REMOVED', 'COMMENT_ADDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bug_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."bug_activities_type_enum" NOT NULL, "old_value" text, "new_value" text, "bug_id" uuid, "actor_id" uuid, CONSTRAINT "PK_a67527606273be7fe563ee95b3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bug_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "body" text NOT NULL, "bug_id" uuid, "author_id" uuid, "parent_id" uuid, CONSTRAINT "PK_f0b5fcde94249aaa2de2ad287f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bug_labels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "color" text NOT NULL, "project_id" uuid, CONSTRAINT "PK_d37fb53d588966ea6f05f6b7a4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bug_reproduction_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order" integer NOT NULL, "description" text NOT NULL, "bug_id" uuid, CONSTRAINT "PK_1ed48f18b447ddea27a0f0729fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bugs_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'WONT_FIX')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bugs_priority_enum" AS ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bugs_source_enum" AS ENUM('SDK', 'DASHBOARD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bugs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" text NOT NULL, "description" text, "status" "public"."bugs_status_enum" NOT NULL, "priority" "public"."bugs_priority_enum" NOT NULL, "environment" text, "expected_behavior" text, "actual_behavior" text, "browser_context" jsonb, "server_context" jsonb, "breadcrumbs" jsonb, "metadata" jsonb, "source" "public"."bugs_source_enum" NOT NULL, "project_id" uuid, "reporter_id" uuid, "assignee_id" uuid, "exception_id" uuid, CONSTRAINT "PK_dadac7f01b703d50496ae1d3e74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bug_label_bugs" ("bug_id" uuid NOT NULL, "label_id" uuid NOT NULL, CONSTRAINT "PK_f9d4054c397397f7acb02cb9a6f" PRIMARY KEY ("bug_id", "label_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d11f241f1b0a1e7ac07c4c1aa" ON "bug_label_bugs" ("bug_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f3b75471b118bd4ea8728197b" ON "bug_label_bugs" ("label_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "UQ_82fe16de7d4f54a775018c70ce5" UNIQUE ("external_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_activities" ADD CONSTRAINT "FK_227dcda7ff0b7e6afb951a3dbd4" FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_activities" ADD CONSTRAINT "FK_ead406a0f43c0117a44640811ea" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_comments" ADD CONSTRAINT "FK_8555d0b1bead9deccc9807fd1c6" FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_comments" ADD CONSTRAINT "FK_a64c80bad693a57ec01a39fe833" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_comments" ADD CONSTRAINT "FK_268cdd2d6431751d742f6aa0ff7" FOREIGN KEY ("parent_id") REFERENCES "bug_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_labels" ADD CONSTRAINT "FK_6f5d9e3811245d32b8f5c0c72e6" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_reproduction_steps" ADD CONSTRAINT "FK_f250288a0e839f85489a1c4d7ab" FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_0cd460bbf233d272a8dc7838fb6" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_e157d615a2273a15d3e692dfc65" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_728c66a9533f05d8bf0db845e9c" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_0618bbe8a138cc397fdec897543" FOREIGN KEY ("exception_id") REFERENCES "exceptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_label_bugs" ADD CONSTRAINT "FK_4d11f241f1b0a1e7ac07c4c1aa8" FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_label_bugs" ADD CONSTRAINT "FK_2f3b75471b118bd4ea8728197b7" FOREIGN KEY ("label_id") REFERENCES "bug_labels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bug_label_bugs" DROP CONSTRAINT "FK_2f3b75471b118bd4ea8728197b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_label_bugs" DROP CONSTRAINT "FK_4d11f241f1b0a1e7ac07c4c1aa8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_0618bbe8a138cc397fdec897543"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_728c66a9533f05d8bf0db845e9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_e157d615a2273a15d3e692dfc65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_0cd460bbf233d272a8dc7838fb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_reproduction_steps" DROP CONSTRAINT "FK_f250288a0e839f85489a1c4d7ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_labels" DROP CONSTRAINT "FK_6f5d9e3811245d32b8f5c0c72e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_comments" DROP CONSTRAINT "FK_268cdd2d6431751d742f6aa0ff7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_comments" DROP CONSTRAINT "FK_a64c80bad693a57ec01a39fe833"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_comments" DROP CONSTRAINT "FK_8555d0b1bead9deccc9807fd1c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_activities" DROP CONSTRAINT "FK_ead406a0f43c0117a44640811ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_activities" DROP CONSTRAINT "FK_227dcda7ff0b7e6afb951a3dbd4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "UQ_82fe16de7d4f54a775018c70ce5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f3b75471b118bd4ea8728197b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4d11f241f1b0a1e7ac07c4c1aa"`,
    );
    await queryRunner.query(`DROP TABLE "bug_label_bugs"`);
    await queryRunner.query(`DROP TABLE "bugs"`);
    await queryRunner.query(`DROP TYPE "public"."bugs_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bugs_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bugs_status_enum"`);
    await queryRunner.query(`DROP TABLE "bug_reproduction_steps"`);
    await queryRunner.query(`DROP TABLE "bug_labels"`);
    await queryRunner.query(`DROP TABLE "bug_comments"`);
    await queryRunner.query(`DROP TABLE "bug_activities"`);
    await queryRunner.query(`DROP TYPE "public"."bug_activities_type_enum"`);
  }
}

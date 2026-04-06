import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeedbackTables1775493068355 implements MigrationInterface {
  name = 'AddFeedbackTables1775493068355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_activities_type_enum" AS ENUM('STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNEE_CHANGED', 'COMMENT_ADDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."feedback_activities_type_enum" NOT NULL, "old_value" text, "new_value" text, "feedback_id" uuid, "actor_id" uuid, CONSTRAINT "PK_7780a578bd1dd2cfd7ea178ac92" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "body" text NOT NULL, "feedback_id" uuid, "author_id" uuid, "parent_id" uuid, CONSTRAINT "PK_b7f0dc5cf0fc2dfc18545807317" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "feedback_id" uuid, "file_id" uuid, CONSTRAINT "PK_87027fbf19d69c09a6ffd7d5167" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_type_enum" AS ENUM('IDEA', 'FEATURE_REQUEST', 'IMPROVEMENT', 'GENERAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_status_enum" AS ENUM('NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_impact_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_source_enum" AS ENUM('DASHBOARD', 'PUBLIC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" text NOT NULL, "description" text, "type" "public"."feedback_type_enum" NOT NULL, "status" "public"."feedback_status_enum" NOT NULL, "priority" "public"."feedback_priority_enum" NOT NULL, "impact" "public"."feedback_impact_enum", "source" "public"."feedback_source_enum" NOT NULL, "submitter_name" text, "submitter_email" text, "metadata" jsonb, "project_id" uuid, "reporter_id" uuid, "assignee_id" uuid, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."files_purpose_enum" RENAME TO "files_purpose_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."files_purpose_enum" AS ENUM('BUG', 'ISSUE', 'FEEDBACK', 'AI_CHAT', 'AVATAR', 'LOGO', 'ATTACHMENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "purpose" TYPE "public"."files_purpose_enum" USING "purpose"::"text"::"public"."files_purpose_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."files_purpose_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "feedback_activities" ADD CONSTRAINT "FK_1b7cd3b07a174b70bc43696ea66" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_activities" ADD CONSTRAINT "FK_2261e94d5a11c9ea643c8e75e56" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_comments" ADD CONSTRAINT "FK_39f3c965be63fb544b6e8a7078a" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_comments" ADD CONSTRAINT "FK_05f5b237de7636e44577b906b73" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_comments" ADD CONSTRAINT "FK_50d5e12c712aeeb59fe8d6176fe" FOREIGN KEY ("parent_id") REFERENCES "feedback_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_files" ADD CONSTRAINT "FK_34c4d3a7d8e8195a30e8b2adbfb" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_files" ADD CONSTRAINT "FK_39fa77caa1f35af6699b3961d76" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_9663584ecca8b5653f8fbe6e9a9" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_163c7a41b03ac673b7065d0e63b" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_9cf54af70287c416a19389ad94e" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_9cf54af70287c416a19389ad94e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_163c7a41b03ac673b7065d0e63b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_9663584ecca8b5653f8fbe6e9a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_files" DROP CONSTRAINT "FK_39fa77caa1f35af6699b3961d76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_files" DROP CONSTRAINT "FK_34c4d3a7d8e8195a30e8b2adbfb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_comments" DROP CONSTRAINT "FK_50d5e12c712aeeb59fe8d6176fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_comments" DROP CONSTRAINT "FK_05f5b237de7636e44577b906b73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_comments" DROP CONSTRAINT "FK_39f3c965be63fb544b6e8a7078a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_activities" DROP CONSTRAINT "FK_2261e94d5a11c9ea643c8e75e56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_activities" DROP CONSTRAINT "FK_1b7cd3b07a174b70bc43696ea66"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."files_purpose_enum_old" AS ENUM('BUG', 'ISSUE', 'AI_CHAT', 'AVATAR', 'LOGO', 'ATTACHMENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "purpose" TYPE "public"."files_purpose_enum_old" USING "purpose"::"text"::"public"."files_purpose_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."files_purpose_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."files_purpose_enum_old" RENAME TO "files_purpose_enum"`,
    );
    await queryRunner.query(`DROP TABLE "feedback"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_impact_enum"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_type_enum"`);
    await queryRunner.query(`DROP TABLE "feedback_files"`);
    await queryRunner.query(`DROP TABLE "feedback_comments"`);
    await queryRunner.query(`DROP TABLE "feedback_activities"`);
    await queryRunner.query(
      `DROP TYPE "public"."feedback_activities_type_enum"`,
    );
  }
}

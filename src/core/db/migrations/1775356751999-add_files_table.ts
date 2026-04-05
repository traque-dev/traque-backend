import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesTable1775356751999 implements MigrationInterface {
  name = 'AddFilesTable1775356751999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."files_purpose_enum" AS ENUM('BUG', 'ISSUE', 'AI_CHAT', 'AVATAR', 'LOGO', 'ATTACHMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "key" text NOT NULL, "original_name" text NOT NULL, "mime_type" text NOT NULL, "size" bigint NOT NULL, "purpose" "public"."files_purpose_enum" NOT NULL, "uploaded_by_id" uuid, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_b25b4b9c85b6e6ffa2789dc5da5" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_b25b4b9c85b6e6ffa2789dc5da5"`,
    );
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TYPE "public"."files_purpose_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBugFilesTable1775364813356 implements MigrationInterface {
  name = 'AddBugFilesTable1775364813356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bug_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "bug_id" uuid, "file_id" uuid, CONSTRAINT "PK_d82b5a1af04e2a800759904ed71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_files" ADD CONSTRAINT "FK_50ab6fcac4b6a65923923f1e0e2" FOREIGN KEY ("bug_id") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_files" ADD CONSTRAINT "FK_3f917d08fe82547abd638aa25dc" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bug_files" DROP CONSTRAINT "FK_3f917d08fe82547abd638aa25dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bug_files" DROP CONSTRAINT "FK_50ab6fcac4b6a65923923f1e0e2"`,
    );
    await queryRunner.query(`DROP TABLE "bug_files"`);
  }
}

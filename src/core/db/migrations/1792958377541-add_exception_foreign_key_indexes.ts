import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExceptionForeignKeyIndexes1792958377541
  implements MigrationInterface
{
  name = 'AddExceptionForeignKeyIndexes1792958377541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_exception_frames_exception_id" ON "exception_frames" ("exception_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_exceptions_project_id" ON "exceptions" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_bugs_exception_id" ON "bugs" ("exception_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_bugs_exception_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_exceptions_project_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_exception_frames_exception_id"`,
    );
  }
}

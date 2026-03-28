import { MigrationInterface, QueryRunner } from 'typeorm';

export class BugSourceBrowserExtension1774731300107
  implements MigrationInterface
{
  name = 'BugSourceBrowserExtension1774731300107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."bugs_source_enum" RENAME TO "bugs_source_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bugs_source_enum" AS ENUM('SDK', 'DASHBOARD', 'BROWSER_EXTENSION')`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ALTER COLUMN "source" TYPE "public"."bugs_source_enum" USING "source"::"text"::"public"."bugs_source_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."bugs_source_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."bugs_source_enum_old" AS ENUM('SDK', 'DASHBOARD')`,
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ALTER COLUMN "source" TYPE "public"."bugs_source_enum_old" USING "source"::"text"::"public"."bugs_source_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."bugs_source_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."bugs_source_enum_old" RENAME TO "bugs_source_enum"`,
    );
  }
}

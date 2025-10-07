import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteExceptionIdColumnFromHttpContextTable1739221687661
  implements MigrationInterface
{
  name = 'DeleteExceptionIdColumnFromHttpContextTable1739221687661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "http_contexts" DROP CONSTRAINT "FK_f3847d23e2adbbb7e6601c1e388"`,
    );
    await queryRunner.query(
      `ALTER TABLE "http_contexts" DROP CONSTRAINT "REL_f3847d23e2adbbb7e6601c1e38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "http_contexts" DROP COLUMN "exception_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "http_contexts" ADD "exception_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "http_contexts" ADD CONSTRAINT "REL_f3847d23e2adbbb7e6601c1e38" UNIQUE ("exception_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "http_contexts" ADD CONSTRAINT "FK_f3847d23e2adbbb7e6601c1e388" FOREIGN KEY ("exception_id") REFERENCES "exceptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

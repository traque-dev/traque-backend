import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResponseColumnInHttpContext1745690954117
  implements MigrationInterface
{
  name = 'AddResponseColumnInHttpContext1745690954117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "http_contexts" ADD "response" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "http_contexts" DROP COLUMN "response"`,
    );
  }
}

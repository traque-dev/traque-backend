import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthorizedUrlsColumnInProject1742324572454
  implements MigrationInterface
{
  name = 'AddAuthorizedUrlsColumnInProject1742324572454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "authorized_urls" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "authorized_urls"`,
    );
  }
}

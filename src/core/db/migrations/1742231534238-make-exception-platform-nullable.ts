import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeExceptionPlatformNullable1742231534238
  implements MigrationInterface
{
  name = 'MakeExceptionPlatformNullable1742231534238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exceptions" ALTER COLUMN "platform" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exceptions" ALTER COLUMN "platform" SET NOT NULL`,
    );
  }
}

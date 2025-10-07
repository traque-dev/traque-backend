import { MigrationInterface, QueryRunner } from 'typeorm';

export class TwoFactorEnabledNullableInUserTable1738427135893
  implements MigrationInterface
{
  name = 'TwoFactorEnabledNullableInUserTable1738427135893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "two_factor_enabled" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "two_factor_enabled" SET NOT NULL`,
    );
  }
}

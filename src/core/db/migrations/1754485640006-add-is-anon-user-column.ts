import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAnonUserColumn1754485640006 implements MigrationInterface {
  name = 'AddIsAnonUserColumn1754485640006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "is_anonymous" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_anonymous"`);
  }
}

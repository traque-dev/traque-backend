import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendProjectEntity1742052197195 implements MigrationInterface {
  name = 'ExtendProjectEntity1742052197195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" ADD "slug" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."projects_platform_enum" AS ENUM('NEST_JS', 'NODE_JS', 'JAVA', 'PYTHON', 'REACT', 'NEXT_JS', 'REACT_NATIVE', 'EXPO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "platform" "public"."projects_platform_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "platform"`);
    await queryRunner.query(`DROP TYPE "public"."projects_platform_enum"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "slug"`);
  }
}

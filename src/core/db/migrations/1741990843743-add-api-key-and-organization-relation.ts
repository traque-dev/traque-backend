import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiKeyAndOrganizationRelation1741990843743
  implements MigrationInterface
{
  name = 'AddApiKeyAndOrganizationRelation1741990843743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD "organization_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."exceptions_platform_enum" RENAME TO "exceptions_platform_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exceptions_platform_enum" AS ENUM('NEST_JS', 'NODE_JS', 'JAVA', 'PYTHON', 'REACT', 'NEXT_JS', 'REACT_NATIVE', 'EXPO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ALTER COLUMN "platform" TYPE "public"."exceptions_platform_enum" USING "platform"::"text"::"public"."exceptions_platform_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."exceptions_platform_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_a283bdef18876e525aefaec042f" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_keys" DROP CONSTRAINT "FK_a283bdef18876e525aefaec042f"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exceptions_platform_enum_old" AS ENUM('NEST_JS', 'NODE_JS', 'JAVA', 'PYTHON')`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ALTER COLUMN "platform" TYPE "public"."exceptions_platform_enum_old" USING "platform"::"text"::"public"."exceptions_platform_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."exceptions_platform_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."exceptions_platform_enum_old" RENAME TO "exceptions_platform_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" DROP COLUMN "organization_id"`,
    );
  }
}

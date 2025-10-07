import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHttpContextsTable1739221329388
  implements MigrationInterface
{
  name = 'CreateHttpContextsTable1739221329388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."http_contexts_method_enum" AS ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "http_contexts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "url" text, "method" "public"."http_contexts_method_enum", "status_code" integer, "status" text, "client_ip" text, "exception_id" uuid, CONSTRAINT "REL_f3847d23e2adbbb7e6601c1e38" UNIQUE ("exception_id"), CONSTRAINT "PK_789efdab6cf2ca10bc8f0fd314b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ADD "http_context_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ADD CONSTRAINT "UQ_02283d7d24404d0ee26dd70e1d0" UNIQUE ("http_context_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "http_contexts" ADD CONSTRAINT "FK_f3847d23e2adbbb7e6601c1e388" FOREIGN KEY ("exception_id") REFERENCES "exceptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" ADD CONSTRAINT "FK_02283d7d24404d0ee26dd70e1d0" FOREIGN KEY ("http_context_id") REFERENCES "http_contexts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exceptions" DROP CONSTRAINT "FK_02283d7d24404d0ee26dd70e1d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "http_contexts" DROP CONSTRAINT "FK_f3847d23e2adbbb7e6601c1e388"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" DROP CONSTRAINT "UQ_02283d7d24404d0ee26dd70e1d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exceptions" DROP COLUMN "http_context_id"`,
    );
    await queryRunner.query(`DROP TABLE "http_contexts"`);
    await queryRunner.query(`DROP TYPE "public"."http_contexts_method_enum"`);
  }
}

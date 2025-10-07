import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAwsWafCredentialsTable1739556290644
  implements MigrationInterface
{
  name = 'CreateAwsWafCredentialsTable1739556290644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "aws_waf_credentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "region" text, "access_key_id" text, "secret_access_key" text, "organization_id" uuid, CONSTRAINT "REL_38ede8beb5d240bb898f6dc141" UNIQUE ("organization_id"), CONSTRAINT "PK_39bbccc74f6b860340080566c2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "aws_waf_credentials" ADD CONSTRAINT "FK_38ede8beb5d240bb898f6dc1412" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "aws_waf_credentials" DROP CONSTRAINT "FK_38ede8beb5d240bb898f6dc1412"`,
    );
    await queryRunner.query(`DROP TABLE "aws_waf_credentials"`);
  }
}

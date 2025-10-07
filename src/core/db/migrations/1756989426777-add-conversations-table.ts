import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationsTable1756989426777 implements MigrationInterface {
  name = 'AddConversationsTable1756989426777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL DEFAULT 'New Chat', "system_prompt" text, "messages" jsonb NOT NULL DEFAULT '[]', "user_id" uuid, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a"`,
    );
    await queryRunner.query(`DROP TABLE "conversations"`);
  }
}

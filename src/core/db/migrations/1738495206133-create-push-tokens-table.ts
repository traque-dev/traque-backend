import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePushTokensTable1738495206133 implements MigrationInterface {
  name = 'CreatePushTokensTable1738495206133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "push_notification_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "expo_push_token" text NOT NULL, "session_id" uuid, CONSTRAINT "REL_e533a13dd3657a39fd262be7be" UNIQUE ("session_id"), CONSTRAINT "PK_4de2b58cd3b6d25024b8dec62e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "FK_e533a13dd3657a39fd262be7bec" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_notification_tokens" DROP CONSTRAINT "FK_e533a13dd3657a39fd262be7bec"`,
    );
    await queryRunner.query(`DROP TABLE "push_notification_tokens"`);
  }
}

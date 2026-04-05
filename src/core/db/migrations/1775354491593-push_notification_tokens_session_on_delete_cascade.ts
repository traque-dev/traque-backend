import { MigrationInterface, QueryRunner } from 'typeorm';

export class PushNotificationTokensSessionOnDeleteCascade1775354491593
  implements MigrationInterface
{
  name = 'PushNotificationTokensSessionOnDeleteCascade1775354491593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_notification_tokens" DROP CONSTRAINT "FK_e533a13dd3657a39fd262be7bec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "FK_e533a13dd3657a39fd262be7bec" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_notification_tokens" DROP CONSTRAINT "FK_e533a13dd3657a39fd262be7bec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "FK_e533a13dd3657a39fd262be7bec" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

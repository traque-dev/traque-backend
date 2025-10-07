import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventNotificationTriggersTable1753618296040
  implements MigrationInterface
{
  name = 'AddEventNotificationTriggersTable1753618296040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event_notification_triggers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "on_event" text NOT NULL, "mobile_push" boolean DEFAULT false, "discord" boolean DEFAULT false, "email" boolean DEFAULT false, "project_id" uuid, CONSTRAINT "PK_2683a5a7b61a5377df9f3fe350a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_notification_triggers" ADD CONSTRAINT "FK_400a4902ceca24fda4961e4ed3f" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_notification_triggers" DROP CONSTRAINT "FK_400a4902ceca24fda4961e4ed3f"`,
    );
    await queryRunner.query(`DROP TABLE "event_notification_triggers"`);
  }
}

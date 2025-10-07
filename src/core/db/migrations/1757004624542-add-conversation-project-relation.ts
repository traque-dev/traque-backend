import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationProjectRelation1757004624542
  implements MigrationInterface
{
  name = 'AddConversationProjectRelation1757004624542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD "project_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_9f16876c6b675f1f683e604b511" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_9f16876c6b675f1f683e604b511"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "project_id"`,
    );
  }
}

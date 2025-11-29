import { generateExternalProjectId } from 'core/utils/generateExternalProjectId';

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalIdProjectColumn1764421172164
  implements MigrationInterface
{
  name = 'AddExternalIdProjectColumn1764421172164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" ADD "external_id" text`);

    const projects = await queryRunner.query(
      'SELECT id FROM projects WHERE external_id IS NULL',
    );

    for (const project of projects) {
      const externalId = generateExternalProjectId();
      await queryRunner.query(
        'UPDATE projects SET external_id = $1 WHERE id = $2',
        [externalId, project.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "external_id"`);
  }
}

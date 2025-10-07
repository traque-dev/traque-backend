import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStacktraceEntity1757796594852 implements MigrationInterface {
  name = 'AddStacktraceEntity1757796594852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "exception_frames" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "frame_index" integer, "filename" text, "function_name" text, "line_number" integer, "column_number" integer, "absolute_path" text, "module" text, "in_app" boolean, "platform" text, "exception_id" uuid, CONSTRAINT "PK_30cbcc9c46db07835137c335e82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "exceptions" ADD "stack" text`);
    await queryRunner.query(
      `ALTER TABLE "exception_frames" ADD CONSTRAINT "FK_eb4361bc5034ee44c1c0e8b9183" FOREIGN KEY ("exception_id") REFERENCES "exceptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exception_frames" DROP CONSTRAINT "FK_eb4361bc5034ee44c1c0e8b9183"`,
    );
    await queryRunner.query(`ALTER TABLE "exceptions" DROP COLUMN "stack"`);
    await queryRunner.query(`DROP TABLE "exception_frames"`);
  }
}

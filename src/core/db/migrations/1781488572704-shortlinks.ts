import { MigrationInterface, QueryRunner } from 'typeorm';

export class Shortlinks1781488572704 implements MigrationInterface {
  name = 'Shortlinks1781488572704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "short_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "slug" text NOT NULL, "domain" text NOT NULL DEFAULT 'traque.app', "destination_url" text NOT NULL, "title" text, "description" text, "is_active" boolean NOT NULL DEFAULT true, "expires_at" TIMESTAMP WITH TIME ZONE, "click_limit" integer, "click_count" integer NOT NULL DEFAULT '0', "last_clicked_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "organization_id" uuid, CONSTRAINT "PK_c3adbf03db8463f26000c7457a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee473d6500498c867752f7ea9e" ON "short_links" ("domain", "slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ea627faa58ea964034fa087365" ON "short_links" ("organization_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."short_link_clicks_device_type_enum" AS ENUM('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "short_link_clicks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "clicked_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ip_address" text, "country" text, "region" text, "city" text, "user_agent" text, "device_type" "public"."short_link_clicks_device_type_enum" NOT NULL DEFAULT 'UNKNOWN', "browser" text, "os" text, "referer" text, "referer_domain" text, "language" text, "is_bot" boolean NOT NULL DEFAULT false, "short_link_id" uuid, CONSTRAINT "PK_ffa91ff7e81606bdaed13029bf5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ffce1d8fa5776589310489f523" ON "short_link_clicks" ("short_link_id", "clicked_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "short_links" ADD CONSTRAINT "FK_ea627faa58ea964034fa087365e" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "short_link_clicks" ADD CONSTRAINT "FK_de4820c4b1e97e7dea94bc5980c" FOREIGN KEY ("short_link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "short_link_clicks" DROP CONSTRAINT "FK_de4820c4b1e97e7dea94bc5980c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "short_links" DROP CONSTRAINT "FK_ea627faa58ea964034fa087365e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ffce1d8fa5776589310489f523"`,
    );
    await queryRunner.query(`DROP TABLE "short_link_clicks"`);
    await queryRunner.query(
      `DROP TYPE "public"."short_link_clicks_device_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ea627faa58ea964034fa087365"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee473d6500498c867752f7ea9e"`,
    );
    await queryRunner.query(`DROP TABLE "short_links"`);
  }
}

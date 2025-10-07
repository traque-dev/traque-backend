import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionsTable1759174392747
  implements MigrationInterface
{
  name = 'CreateSubscriptionsTable1759174392747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_source_enum" AS ENUM('STRIPE', 'POLAR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "plan" text NOT NULL, "reference_id" text NOT NULL, "stripe_customer_id" text, "stripe_subscription_id" text, "polar_customer_id" text, "polar_subscription_id" text, "status" text NOT NULL, "period_start" TIMESTAMP, "period_end" TIMESTAMP, "cancel_at_period_end" boolean, "seats" integer, "trial_start" TIMESTAMP, "trial_end" TIMESTAMP, "source" "public"."subscriptions_source_enum" NOT NULL, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_source_enum"`);
  }
}

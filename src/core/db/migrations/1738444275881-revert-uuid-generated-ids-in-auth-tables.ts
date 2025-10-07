import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertUuidGeneratedIdsInAuthTables1738444275881
  implements MigrationInterface
{
  name = 'RevertUuidGeneratedIdsInAuthTables1738444275881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "PK_3238ef96f18b355b671619111bc"`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "FK_162c7f53b41b84102a8e06eff18"`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "PK_5a7a02c20412299d198e097a8fe"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "verifications" DROP CONSTRAINT "PK_2127ad1b143cf012280390b01d1"`,
    );
    await queryRunner.query(`ALTER TABLE "verifications" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "verifications" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "verifications" ADD CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "PK_d9e707ebc943c110fcaab7cdd8c"`,
    );
    await queryRunner.query(`ALTER TABLE "two_factor" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "PK_d9e707ebc943c110fcaab7cdd8c" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "UQ_162c7f53b41b84102a8e06eff18"`,
    );
    await queryRunner.query(`ALTER TABLE "two_factor" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "two_factor" ADD "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "UQ_162c7f53b41b84102a8e06eff18" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_40c051286e8db5b4613ecb3035a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_585c8ce06628c70b70100bfb842"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9"`,
    );
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "PK_28b53062261b996d9c99fa12404"`,
    );
    await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "members" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP COLUMN "organization_id"`,
    );
    await queryRunner.query(`ALTER TABLE "members" ADD "organization_id" uuid`);
    await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "members" ADD "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07"`,
    );
    await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP COLUMN "organization_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD "organization_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP COLUMN "inviter_id"`,
    );
    await queryRunner.query(`ALTER TABLE "invitations" ADD "inviter_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "jwks" DROP CONSTRAINT "PK_147086b49bf8366682d1a7ca7c1"`,
    );
    await queryRunner.query(`ALTER TABLE "jwks" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "jwks" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "jwks" ADD CONSTRAINT "PK_147086b49bf8366682d1a7ca7c1" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "organization_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "organization_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "FK_162c7f53b41b84102a8e06eff18" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_40c051286e8db5b4613ecb3035a" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_585c8ce06628c70b70100bfb842" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_585c8ce06628c70b70100bfb842"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_40c051286e8db5b4613ecb3035a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "FK_162c7f53b41b84102a8e06eff18"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "organization_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "organization_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "jwks" DROP CONSTRAINT "PK_147086b49bf8366682d1a7ca7c1"`,
    );
    await queryRunner.query(`ALTER TABLE "jwks" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "jwks" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "jwks" ADD CONSTRAINT "PK_147086b49bf8366682d1a7ca7c1" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP COLUMN "inviter_id"`,
    );
    await queryRunner.query(`ALTER TABLE "invitations" ADD "inviter_id" text`);
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP COLUMN "organization_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD "organization_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07"`,
    );
    await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "invitations" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "members" ADD "user_id" text`);
    await queryRunner.query(
      `ALTER TABLE "members" DROP COLUMN "organization_id"`,
    );
    await queryRunner.query(`ALTER TABLE "members" ADD "organization_id" text`);
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "PK_28b53062261b996d9c99fa12404"`,
    );
    await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "members" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9"`,
    );
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "id" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_585c8ce06628c70b70100bfb842" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_40c051286e8db5b4613ecb3035a" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "UQ_162c7f53b41b84102a8e06eff18"`,
    );
    await queryRunner.query(`ALTER TABLE "two_factor" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "two_factor" ADD "user_id" text`);
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "UQ_162c7f53b41b84102a8e06eff18" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" DROP CONSTRAINT "PK_d9e707ebc943c110fcaab7cdd8c"`,
    );
    await queryRunner.query(`ALTER TABLE "two_factor" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "two_factor" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "PK_d9e707ebc943c110fcaab7cdd8c" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "verifications" DROP CONSTRAINT "PK_2127ad1b143cf012280390b01d1"`,
    );
    await queryRunner.query(`ALTER TABLE "verifications" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "verifications" ADD "id" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "verifications" ADD CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "user_id" text`);
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "PK_5a7a02c20412299d198e097a8fe"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "two_factor" ADD CONSTRAINT "FK_162c7f53b41b84102a8e06eff18" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "user_id" text`);
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "PK_3238ef96f18b355b671619111bc"`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

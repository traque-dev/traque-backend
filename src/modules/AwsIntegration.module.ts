import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AwsWafIntegrationController } from 'controllers/AwsWafIntegration.controller';
import { AwsWafCredentials } from 'models/entity/integrations/aws/waf/AwsWafCredentials.entity';
import { Organization } from 'models/entity/Organization.entity';
import { AwsWafCredentialsMapper } from 'models/mappers/AwsWafCredentials.mapper';
import { EncryptionModule } from 'modules/Encryption.module';
import { OrganizationModule } from 'modules/Organization.module';
import { AwsWafService } from 'services/integrations/aws/waf/AwsWaf.service';

@Module({
  imports: [
    OrganizationModule,
    TypeOrmModule.forFeature([AwsWafCredentials, Organization]),
    EncryptionModule,
  ],
  controllers: [AwsWafIntegrationController],
  providers: [AwsWafService, AwsWafCredentialsMapper],
})
export class AwsIntegrationModule {}

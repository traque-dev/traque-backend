import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyController } from 'controllers/ApiKey.controller';
import { ApiKey } from 'models/entity/ApiKey.entity';
import { Organization } from 'models/entity/Organization.entity';
import { OrganizationModule } from 'modules/Organization.module';
import { ApiKeyService } from 'services/ApiKey.service';

@Module({
  imports: [
    OrganizationModule,
    TypeOrmModule.forFeature([ApiKey, Organization]),
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}

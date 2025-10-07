import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationController } from 'controllers/Organization.controller';
import { Member } from 'models/entity/Member.entity';
import { Organization } from 'models/entity/Organization.entity';
import { OrganizationMapper } from 'models/mappers/Organization.mapper';
import { OrganizationService } from 'services/Organization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Member])],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationMapper],
  exports: [OrganizationService, OrganizationMapper],
})
export class OrganizationModule {}

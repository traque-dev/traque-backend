import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectController } from 'controllers/Project.controller';
import { Project } from 'models/entity/Project.entity';
import { ProjectMapper } from 'models/mappers/Project.mapper';
import { ApiKeyModule } from 'modules/ApiKey.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectService } from 'services/Project.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    OrganizationModule,
    ApiKeyModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectMapper],
  exports: [ProjectService, ProjectMapper],
})
export class ProjectModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IssueController } from 'controllers/Issue.controller';
import { Exception } from 'models/entity/Exception.entity';
import { HttpContext } from 'models/entity/HttpContext.entity';
import { Issue } from 'models/entity/Issue.entity';
import { IssueMapper } from 'models/mappers/Issue.mapper';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { IssueService } from 'services/Issue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, Exception, HttpContext]),
    OrganizationModule,
    ProjectModule,
  ],
  controllers: [IssueController],
  providers: [IssueService, IssueMapper],
  exports: [IssueService, IssueMapper],
})
export class IssueModule {}

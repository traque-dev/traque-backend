import { ApiKeyProjectMiddleware } from 'core/middlewares/ApiKeyProject.middleware';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExceptionController } from 'controllers/Exception.controller';
import { ExceptionCaptureController } from 'controllers/ExceptionCapture.controller';
import { ExceptionStatisticController } from 'controllers/ExceptionStatistic.controller';
import { ExceptionListener } from 'listeners/Exception.listener';
import { Exception } from 'models/entity/Exception.entity';
import { Issue } from 'models/entity/Issue.entity';
import { Member } from 'models/entity/Member.entity';
import { Project } from 'models/entity/Project.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { ExceptionMapper } from 'models/mappers/Exception.mapper';
import { IssueModule } from 'modules/Issue.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { ExceptionService } from 'services/Exception.service';
import { ExceptionStatisticService } from 'services/ExceptionStatistic.service';
import { PushNotificationService } from 'services/PushNotification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Exception,
      Member,
      PushNotificationToken,
      Issue,
    ]),
    IssueModule,
    OrganizationModule,
    ProjectModule,
  ],
  controllers: [
    ExceptionController,
    ExceptionCaptureController,
    ExceptionStatisticController,
  ],
  providers: [
    ExceptionService,
    ExceptionMapper,
    ExceptionListener,
    PushNotificationService,
    ExceptionStatisticService,
  ],
})
export class ExceptionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyProjectMiddleware).forRoutes('*path');
  }
}

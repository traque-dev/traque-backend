import { TraquePlusGuard } from 'core/guards/TraquePlus.guard';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExceptionAnalyzerAgent } from 'agents/ExceptionAnalyzer.agent';

import { AiAgentController } from 'controllers/AiAgentController.controller';
import { Conversation } from 'models/entity/Conversation.entity';
import { Exception } from 'models/entity/Exception.entity';
import { Issue } from 'models/entity/Issue.entity';
import { Member } from 'models/entity/Member.entity';
import { Project } from 'models/entity/Project.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { Subscription } from 'models/entity/Subscription.entity';
import { ConversationMapper } from 'models/mappers/Conversation.mapper';
import { IssueModule } from 'modules/Issue.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { ExceptionSamplingService } from 'services/ExceptionSampling.service';
import { ExceptionStatisticService } from 'services/ExceptionStatistic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Exception,
      Member,
      PushNotificationToken,
      Issue,
      Conversation,
      Subscription,
    ]),
    IssueModule,
    OrganizationModule,
    ProjectModule,
  ],
  controllers: [AiAgentController],
  providers: [
    ExceptionAnalyzerAgent,
    ConversationMapper,
    ExceptionStatisticService,
    TraquePlusGuard,
    ExceptionSamplingService,
  ],
  exports: [],
})
export class AiModule {}

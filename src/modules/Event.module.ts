import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from 'controllers/Event.controller';
import { EventCaptureController } from 'controllers/EventCapture.controller';
import { EventNotificationTriggerController } from 'controllers/EventNotificationTrigger.controller';
import { EventListener } from 'listeners/Event.listener';
import { Event } from 'models/entity/Event.entity';
import { EventNotificationTrigger } from 'models/entity/EventNotificationTrigger.entity';
import { Member } from 'models/entity/Member.entity';
import { Project } from 'models/entity/Project.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { EventMapper } from 'models/mappers/Event.mapper';
import { EventNotificationTriggerMapper } from 'models/mappers/EventNotificationTrigger.mapper';
import { ProjectMapper } from 'models/mappers/Project.mapper';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { EventService } from 'services/Event.service';
import { PushNotificationService } from 'services/PushNotification.service';

@Module({
  imports: [
    OrganizationModule,
    ProjectModule,
    TypeOrmModule.forFeature([
      Project,
      Event,
      Member,
      PushNotificationToken,
      EventNotificationTrigger,
    ]),
  ],
  controllers: [
    EventCaptureController,
    EventController,
    EventNotificationTriggerController,
  ],
  providers: [
    EventService,
    EventListener,
    PushNotificationService,
    EventMapper,
    EventNotificationTriggerMapper,
    ProjectMapper,
  ],
})
export class EventModule {}

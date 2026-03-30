import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncidentController } from 'controllers/uptime/Incident.controller';
import { IncidentListener } from 'listeners/uptime/Incident.listener';
import { Member } from 'models/entity/Member.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { Incident } from 'models/entity/uptime/Incident.entity';
import { IncidentTimelineEntry } from 'models/entity/uptime/IncidentTimelineEntry.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
import { OrganizationModule } from 'modules/Organization.module';
import { PushNotificationService } from 'services/PushNotification.service';
import { IncidentService } from 'services/uptime/Incident.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Incident,
      IncidentTimelineEntry,
      Monitor,
      MonitorCheck,
      Member,
      PushNotificationToken,
    ]),
    OrganizationModule,
  ],
  controllers: [IncidentController],
  providers: [IncidentService, IncidentListener, PushNotificationService],
  exports: [IncidentService],
})
export class UptimeIncidentModule {}

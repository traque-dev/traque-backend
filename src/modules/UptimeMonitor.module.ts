import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorCheckProcessor } from 'queues/uptime/MonitorCheck.processor';
import { UPTIME_MONITOR_CHECK_QUEUE } from 'queues/uptime/UptimeQueue.constants';

import { MonitorController } from 'controllers/uptime/Monitor.controller';
import { MonitorCheckController } from 'controllers/uptime/MonitorCheck.controller';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
import { OrganizationModule } from 'modules/Organization.module';
import { UptimeIncidentModule } from 'modules/UptimeIncident.module';
import { MonitorService } from 'services/uptime/Monitor.service';
import { MonitorCheckService } from 'services/uptime/MonitorCheck.service';
import { MonitorCheckEngine } from 'services/uptime/MonitorCheckEngine.service';

const UptimeCheckQueueRegistration = BullModule.registerQueue({
  name: UPTIME_MONITOR_CHECK_QUEUE,
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor, MonitorCheck]),
    UptimeCheckQueueRegistration,
    OrganizationModule,
    UptimeIncidentModule,
  ],
  controllers: [MonitorController, MonitorCheckController],
  providers: [
    MonitorService,
    MonitorCheckService,
    MonitorCheckEngine,
    MonitorCheckProcessor,
  ],
  exports: [MonitorService, MonitorCheckService],
})
export class UptimeMonitorModule {}

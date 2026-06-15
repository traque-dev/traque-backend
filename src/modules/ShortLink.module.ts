import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLinkClickProcessor } from 'queues/shortlink/ShortLinkClick.processor';
import { SHORT_LINK_CLICK_QUEUE } from 'queues/shortlink/ShortLinkQueue.constants';

import { ShortLinkController } from 'controllers/shortlink/ShortLink.controller';
import { ShortLinkRedirectController } from 'controllers/shortlink/ShortLinkRedirect.controller';
import { ShortLinkTrackingController } from 'controllers/shortlink/ShortLinkTracking.controller';
import { ShortLink } from 'models/entity/shortlink/ShortLink.entity';
import { ShortLinkClick } from 'models/entity/shortlink/ShortLinkClick.entity';
import { ShortLinkMapper } from 'models/mappers/shortlink/ShortLink.mapper';
import { ShortLinkClickMapper } from 'models/mappers/shortlink/ShortLinkClick.mapper';
import { IpDetailsModule } from 'modules/IpDetails.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ShortLinkService } from 'services/shortlink/ShortLink.service';
import { ShortLinkTrackingService } from 'services/shortlink/ShortLinkTracking.service';

const ShortLinkClickQueueRegistration = BullModule.registerQueue({
  name: SHORT_LINK_CLICK_QUEUE,
});

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortLink, ShortLinkClick]),
    ShortLinkClickQueueRegistration,
    OrganizationModule,
    IpDetailsModule,
  ],
  controllers: [
    ShortLinkController,
    ShortLinkTrackingController,
    ShortLinkRedirectController,
  ],
  providers: [
    ShortLinkService,
    ShortLinkTrackingService,
    ShortLinkClickProcessor,
    ShortLinkMapper,
    ShortLinkClickMapper,
  ],
  exports: [ShortLinkService],
})
export class ShortLinkModule {}

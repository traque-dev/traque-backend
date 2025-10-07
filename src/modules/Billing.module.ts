import { TraquePlusGuard } from 'core/guards/TraquePlus.guard';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionController } from 'controllers/Subscription.controller';
import { Subscription } from 'models/entity/Subscription.entity';
import { SubscriptionMapper } from 'models/mappers/Subscription.mapper';
import { OrganizationModule } from 'modules/Organization.module';
import { SubscriptionService } from 'services/Subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), OrganizationModule],
  controllers: [SubscriptionController],
  providers: [TraquePlusGuard, SubscriptionService, SubscriptionMapper],
  exports: [TraquePlusGuard, SubscriptionService],
})
export class BillingModule {}

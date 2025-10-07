import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WaitlistController } from 'controllers/Waitlist.controller';
import { WaitlistParticipant } from 'models/entity/WaitlistParticipant.entity';
import { WaitlistService } from 'services/Waitlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([WaitlistParticipant])],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}

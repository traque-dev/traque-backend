import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IpDetailsController } from 'controllers/IpDetails.controller';
import { IpAddress } from 'models/entity/IpAddress.entity';
import { IpAddressMapper } from 'models/mappers/IpAddress.mapper';
import { IpDetailsService } from 'services/IpDetails.service';

@Module({
  imports: [TypeOrmModule.forFeature([IpAddress]), HttpModule.register({})],
  controllers: [IpDetailsController],
  providers: [IpDetailsService, IpAddressMapper],
  exports: [],
})
export class IpDetailsModule {}

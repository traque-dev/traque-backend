import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from 'models/entity/Project.entity';
import { ExceptionModule } from 'modules/Exception.module';

import { IngestProcessor } from './Ingest.processor';
import { INGEST_QUEUE } from './IngestQueue.constants';

const IngestQueueRegistration = BullModule.registerQueue({
  name: INGEST_QUEUE,
});

@Module({
  imports: [
    IngestQueueRegistration,
    TypeOrmModule.forFeature([Project]),
    ExceptionModule,
  ],
  providers: [IngestProcessor],
  exports: [IngestQueueRegistration],
})
export class IngestQueueModule {}

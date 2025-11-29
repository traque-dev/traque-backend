import { Module } from '@nestjs/common';
import { IngestQueueModule } from 'queues/ingest/IngestQueue.module';

import { EnvelopeController } from 'controllers/Envelope.controller';

@Module({
  imports: [IngestQueueModule],
  controllers: [EnvelopeController],
})
export class EnvelopeModule {}

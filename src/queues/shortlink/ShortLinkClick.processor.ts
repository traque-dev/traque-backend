import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { ShortLinkTrackingService } from 'services/shortlink/ShortLinkTracking.service';

import {
  SHORT_LINK_CLICK_JOB,
  SHORT_LINK_CLICK_QUEUE,
} from './ShortLinkQueue.constants';
import type { ShortLinkClickJobData } from './ShortLinkQueue.types';

@Processor(SHORT_LINK_CLICK_QUEUE)
export class ShortLinkClickProcessor extends WorkerHost {
  private readonly logger = new Logger(ShortLinkClickProcessor.name);

  constructor(private readonly trackingService: ShortLinkTrackingService) {
    super();
  }

  async process(job: Job<ShortLinkClickJobData>): Promise<void> {
    if (job.name !== SHORT_LINK_CLICK_JOB) {
      return;
    }

    try {
      await this.trackingService.recordClick(job.data);
    } catch (error) {
      this.logger.error(
        `Failed to record click for short link ${job.data.shortLinkId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

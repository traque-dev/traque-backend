import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

type RateLimitOptions = {
  ttl: number;
  limit: number;
};

export const RateLimit = ({ ttl = 60000, limit = 10 }: RateLimitOptions) =>
  applyDecorators(
    Throttle({ default: { ttl, limit } }),
    UseGuards(ThrottlerGuard),
  );

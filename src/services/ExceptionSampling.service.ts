import { Injectable } from '@nestjs/common';

import { Exception } from 'models/entity/Exception.entity';

@Injectable()
export class ExceptionSamplingService {
  public perIssueCap: number = Number.parseInt(
    process.env.AI_EXCEPTIONS_PER_ISSUE_CAP ?? '10',
    10,
  );

  public globalCap: number = Number.parseInt(
    process.env.AI_EXCEPTIONS_GLOBAL_CAP ?? '100',
    10,
  );

  public fetchMultiplier: number = Number.parseInt(
    process.env.AI_EXCEPTIONS_FETCH_MULTIPLIER ?? '3',
    10,
  );

  constructor() {}

  preprocessException(exception: Exception): string {
    let base = `<exception created_at="${exception.createdAt.toISOString()}" name="${exception.name}" message="${exception.message}" path="${exception.httpContext?.url}"`;

    if (exception.httpContext) {
      base += ` method="${exception.httpContext?.method}" status="${exception.httpContext?.status}" status_code="${exception.httpContext?.statusCode}"`;
    }

    return `${base} />`;
  }

  fingerprintException(exception: Exception): string {
    const method = exception.httpContext?.method ?? '';
    const status = exception.httpContext?.status ?? '';
    const statusCode = exception.httpContext?.statusCode ?? '';
    const path = exception.httpContext?.url ?? '';
    return [exception.name, exception.message, path, method, status, statusCode]
      .map((v) => String(v ?? ''))
      .join('|');
  }

  dedupeExceptions(exceptions: Exception[]): Exception[] {
    const seen = new Set<string>();
    const result: Exception[] = [];
    for (const ex of exceptions) {
      const fp = this.fingerprintException(ex);
      if (!seen.has(fp)) {
        seen.add(fp);
        result.push(ex);
      }
    }
    return result;
  }

  stratifiedSample(exceptions: Exception[], limit: number): Exception[] {
    if (exceptions.length <= limit) return exceptions.slice();

    // Assumes exceptions sorted by createdAt DESC (newest first)
    const newestCount = Math.ceil(limit * 0.5);
    const oldestCount = Math.floor(limit * 0.2);
    const remaining = limit - newestCount - oldestCount;

    const newest = exceptions.slice(0, newestCount);
    const oldest = exceptions.slice(-oldestCount);

    const middleStart = newestCount;
    const middleEnd = Math.max(exceptions.length - oldestCount, middleStart);
    const middlePool = exceptions.slice(middleStart, middleEnd);

    const randomPick: Exception[] = [];
    if (remaining > 0 && middlePool.length > 0) {
      // Reservoir sampling for remaining from middlePool
      const pool = middlePool.slice();
      for (let i = 0; i < remaining && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        randomPick.push(pool[idx]);
        pool.splice(idx, 1);
      }
    }

    return [...newest, ...randomPick, ...oldest].slice(0, limit);
  }

  enforceGlobalCapByProportion(
    perIssueSamples: Exception[][],
    globalCap: number,
  ): Exception[][] {
    const totals = perIssueSamples.map((arr) => arr.length);
    const total = totals.reduce((a, b) => a + b, 0);
    if (total <= globalCap) return perIssueSamples.map((a) => a.slice());

    const scaled = totals.map((count) =>
      Math.max(1, Math.floor((count / total) * globalCap)),
    );
    let allocated = scaled.reduce((a, b) => a + b, 0);

    // Adjust rounding errors to match exactly globalCap
    if (allocated !== globalCap) {
      const diff = globalCap - allocated; // positive -> need to add; negative -> need to remove
      // Sort indices by remainder descending to distribute fairly
      const remainders = perIssueSamples.map((arr, idx) => ({
        idx,
        remainder: (totals[idx] / total) * globalCap - scaled[idx],
      }));
      remainders.sort((a, b) => b.remainder - a.remainder);

      let i = 0;
      let remaining = Math.abs(diff);
      while (remaining > 0 && remainders.length > 0) {
        const target = remainders[i % remainders.length].idx;
        if (diff > 0) {
          scaled[target] += 1;
        } else if (scaled[target] > 1) {
          scaled[target] -= 1;
        }
        allocated += diff > 0 ? 1 : -1;
        remaining -= 1;
        i += 1;
      }
    }

    return perIssueSamples.map((samples, idx) => samples.slice(0, scaled[idx]));
  }
}

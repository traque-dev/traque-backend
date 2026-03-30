import * as dns from 'node:dns/promises';
import * as http from 'node:http';
import * as https from 'node:https';
import * as net from 'node:net';
import { URL } from 'node:url';

import { Injectable, Logger } from '@nestjs/common';

import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { CheckStatus } from 'models/types/uptime/CheckStatus';
import { HttpMethod } from 'models/types/uptime/HttpMethod';
import { MonitorType } from 'models/types/uptime/MonitorType';

export interface CheckResult {
  status: CheckStatus;
  httpStatusCode?: number;
  errorMessage?: string;
  dnsLookupMs?: number;
  tcpConnectionMs?: number;
  tlsHandshakeMs?: number;
  firstByteMs?: number;
  totalResponseMs?: number;
}

type Timing = {
  start: number;
  dnsLookup: number | null;
  tcpConnection: number | null;
  tlsHandshake: number | null;
  firstByte: number | null;
};

@Injectable()
export class MonitorCheckEngine {
  private readonly logger = new Logger(MonitorCheckEngine.name);

  async performCheck(monitor: Monitor): Promise<CheckResult> {
    try {
      switch (monitor.type) {
        case MonitorType.HTTP_UNAVAILABLE:
          return await this.checkHttpAvailability(monitor);
        case MonitorType.HTTP_KEYWORD_MISSING:
          return await this.checkHttpKeyword(monitor, false);
        case MonitorType.HTTP_KEYWORD_PRESENT:
          return await this.checkHttpKeyword(monitor, true);
        case MonitorType.HTTP_STATUS_CODE:
          return await this.checkHttpStatusCode(monitor);
        case MonitorType.PING:
          return await this.checkPing(monitor);
        case MonitorType.TCP:
          return await this.checkTcp(monitor);
        case MonitorType.DNS:
          return await this.checkDns(monitor);
        default:
          return {
            status: CheckStatus.DOWN,
            errorMessage: `Unsupported monitor type: ${monitor.type}`,
          };
      }
    } catch (error) {
      this.logger.warn(
        `Check failed for monitor ${monitor.id}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        status: CheckStatus.DOWN,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkHttpAvailability(monitor: Monitor): Promise<CheckResult> {
    const result = await this.performHttpRequest(monitor);

    if (result.errorMessage) {
      return { ...result, status: CheckStatus.DOWN };
    }

    const isUp =
      result.httpStatusCode !== undefined && result.httpStatusCode < 400;

    return { ...result, status: isUp ? CheckStatus.UP : CheckStatus.DOWN };
  }

  private async checkHttpKeyword(
    monitor: Monitor,
    shouldContain: boolean,
  ): Promise<CheckResult> {
    const result = await this.performHttpRequest(monitor, true);

    if (result.errorMessage && !result.responseBody) {
      return {
        ...result,
        status: CheckStatus.DOWN,
        responseBody: undefined,
      } as CheckResult;
    }

    // Treat non-2xx responses as DOWN regardless of keyword presence
    if (
      result.httpStatusCode !== undefined &&
      (result.httpStatusCode < 200 || result.httpStatusCode >= 300)
    ) {
      return {
        status: CheckStatus.DOWN,
        httpStatusCode: result.httpStatusCode,
        errorMessage: `Unexpected HTTP status ${result.httpStatusCode}`,
        dnsLookupMs: result.dnsLookupMs,
        tcpConnectionMs: result.tcpConnectionMs,
        tlsHandshakeMs: result.tlsHandshakeMs,
        firstByteMs: result.firstByteMs,
        totalResponseMs: result.totalResponseMs,
      };
    }

    const keyword = monitor.keyword ?? '';
    const bodyContainsKeyword = result.responseBody?.includes(keyword) ?? false;

    const isUp = shouldContain ? bodyContainsKeyword : !bodyContainsKeyword;

    return {
      status: isUp ? CheckStatus.UP : CheckStatus.DOWN,
      httpStatusCode: result.httpStatusCode,
      errorMessage: isUp
        ? undefined
        : shouldContain
          ? `Keyword "${keyword}" not found in response`
          : `Keyword "${keyword}" found in response`,
      dnsLookupMs: result.dnsLookupMs,
      tcpConnectionMs: result.tcpConnectionMs,
      tlsHandshakeMs: result.tlsHandshakeMs,
      firstByteMs: result.firstByteMs,
      totalResponseMs: result.totalResponseMs,
    };
  }

  private async checkHttpStatusCode(monitor: Monitor): Promise<CheckResult> {
    const result = await this.performHttpRequest(monitor);

    if (result.errorMessage) {
      return { ...result, status: CheckStatus.DOWN };
    }

    const expected = monitor.expectedStatusCode ?? 200;
    const isUp = result.httpStatusCode === expected;

    return {
      ...result,
      status: isUp ? CheckStatus.UP : CheckStatus.DOWN,
      errorMessage: isUp
        ? undefined
        : `Expected status ${expected}, got ${result.httpStatusCode}`,
    };
  }

  private async checkPing(monitor: Monitor): Promise<CheckResult> {
    const start = performance.now();

    try {
      const url = new URL(monitor.url);
      const hostname = url.hostname;

      const dnsStart = performance.now();
      await dns.lookup(hostname);
      const dnsEnd = performance.now();

      const tcpStart = performance.now();
      await this.tcpConnect(hostname, 80, monitor.requestTimeoutSeconds);
      const tcpEnd = performance.now();

      const totalMs = performance.now() - start;

      return {
        status: CheckStatus.UP,
        dnsLookupMs: Math.round(dnsEnd - dnsStart),
        tcpConnectionMs: Math.round(tcpEnd - tcpStart),
        totalResponseMs: Math.round(totalMs),
      };
    } catch (error) {
      return {
        status: CheckStatus.DOWN,
        errorMessage: error instanceof Error ? error.message : 'Ping failed',
        totalResponseMs: Math.round(performance.now() - start),
      };
    }
  }

  private async checkTcp(monitor: Monitor): Promise<CheckResult> {
    const start = performance.now();
    const port = monitor.port ?? 80;

    try {
      const url = new URL(monitor.url);

      const dnsStart = performance.now();
      await dns.lookup(url.hostname);
      const dnsEnd = performance.now();

      const tcpStart = performance.now();
      await this.tcpConnect(url.hostname, port, monitor.requestTimeoutSeconds);
      const tcpEnd = performance.now();

      return {
        status: CheckStatus.UP,
        dnsLookupMs: Math.round(dnsEnd - dnsStart),
        tcpConnectionMs: Math.round(tcpEnd - tcpStart),
        totalResponseMs: Math.round(performance.now() - start),
      };
    } catch (error) {
      return {
        status: CheckStatus.DOWN,
        errorMessage:
          error instanceof Error
            ? error.message
            : `TCP connect to port ${port} failed`,
        totalResponseMs: Math.round(performance.now() - start),
      };
    }
  }

  private async checkDns(monitor: Monitor): Promise<CheckResult> {
    const start = performance.now();

    try {
      const url = new URL(monitor.url);

      await dns.resolve(url.hostname);

      return {
        status: CheckStatus.UP,
        dnsLookupMs: Math.round(performance.now() - start),
        totalResponseMs: Math.round(performance.now() - start),
      };
    } catch (error) {
      return {
        status: CheckStatus.DOWN,
        errorMessage:
          error instanceof Error ? error.message : 'DNS resolution failed',
        totalResponseMs: Math.round(performance.now() - start),
      };
    }
  }

  private performHttpRequest(
    monitor: Monitor,
    collectBody = false,
  ): Promise<CheckResult & { responseBody?: string }> {
    return new Promise((resolve) => {
      const url = new URL(monitor.url);
      const isHttps = url.protocol === 'https:';
      const transport = isHttps ? https : http;

      const headers: Record<string, string> = {};
      if (monitor.requestHeaders) {
        for (const h of monitor.requestHeaders) {
          headers[h.name] = h.value;
        }
      }
      if (monitor.basicAuthUsername) {
        const credentials = `${monitor.basicAuthUsername}:${monitor.basicAuthPassword ?? ''}`;
        headers['Authorization'] =
          `Basic ${Buffer.from(credentials).toString('base64')}`;
      }

      const timings: Timing = {
        start: performance.now(),
        dnsLookup: null,
        tcpConnection: null,
        tlsHandshake: null,
        firstByte: null,
      };

      const options: http.RequestOptions = {
        method: monitor.httpMethod ?? HttpMethod.GET,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers,
        timeout: monitor.requestTimeoutSeconds * 1000,
      };

      if (isHttps) {
        options.agent = new https.Agent({
          rejectUnauthorized: monitor.sslVerification,
        });
      }

      // Resolve the request body once so the same value is used for
      // Content-Length and req.write — avoids a timestamp mismatch (Bug 2).
      const resolvedBody =
        monitor.requestBody &&
        options.method !== 'GET' &&
        options.method !== 'HEAD'
          ? monitor.requestBody.replace(/\{timestamp\}/g, Date.now().toString())
          : null;

      if (resolvedBody) {
        headers['Content-Length'] = Buffer.byteLength(resolvedBody).toString();
      }

      const req = transport.request(options, (res) => {
        timings.firstByte = performance.now();

        let body = '';

        if (collectBody) {
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => {
            body += chunk;
          });
        }

        res.on('end', () => {
          const total = performance.now();

          // Use null-safe arithmetic so missing socket events don't produce
          // negative values (Bug 3). Fall back to null when a phase didn't fire.
          const dnsLookupMs =
            timings.dnsLookup !== null
              ? Math.round(timings.dnsLookup - timings.start)
              : undefined;

          const tcpConnectionMs =
            timings.tcpConnection !== null && timings.dnsLookup !== null
              ? Math.round(timings.tcpConnection - timings.dnsLookup)
              : undefined;

          const tlsHandshakeMs =
            isHttps &&
            timings.tlsHandshake !== null &&
            timings.tcpConnection !== null
              ? Math.round(timings.tlsHandshake - timings.tcpConnection)
              : undefined;

          const previousPhase = isHttps
            ? timings.tlsHandshake
            : timings.tcpConnection;
          const firstByteMs =
            timings.firstByte !== null && previousPhase !== null
              ? Math.round(timings.firstByte - previousPhase)
              : undefined;

          resolve({
            status: CheckStatus.UP,
            httpStatusCode: res.statusCode,
            dnsLookupMs,
            tcpConnectionMs,
            tlsHandshakeMs,
            firstByteMs,
            totalResponseMs: Math.round(total - timings.start),
            responseBody: collectBody ? body : undefined,
          });
        });

        if (!collectBody) {
          res.resume();
        }
      });

      req.on('socket', (socket) => {
        socket.on('lookup', () => {
          timings.dnsLookup = performance.now();
        });
        socket.on('connect', () => {
          timings.tcpConnection = performance.now();
        });
        socket.on('secureConnect', () => {
          timings.tlsHandshake = performance.now();
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: CheckStatus.DOWN,
          errorMessage: `Request timed out after ${monitor.requestTimeoutSeconds}s`,
          totalResponseMs: Math.round(performance.now() - timings.start),
        });
      });

      req.on('error', (error) => {
        resolve({
          status: CheckStatus.DOWN,
          errorMessage: error.message,
          totalResponseMs: Math.round(performance.now() - timings.start),
        });
      });

      if (resolvedBody) {
        req.write(resolvedBody);
      }

      req.end();
    });
  }

  private tcpConnect(
    host: string,
    port: number,
    timeoutSeconds: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port }, () => {
        socket.destroy();
        resolve();
      });

      socket.setTimeout(timeoutSeconds * 1000);

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error(`TCP connection timed out after ${timeoutSeconds}s`));
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }
}

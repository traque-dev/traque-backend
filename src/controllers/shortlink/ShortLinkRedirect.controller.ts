import { config } from 'core/config';

import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { ShortLinkService } from 'services/shortlink/ShortLink.service';

import type { Request, Response } from 'express';

const FALLBACK_URL = 'https://traque.app';

@ApiExcludeController()
@Controller({ version: VERSION_NEUTRAL })
export class ShortLinkRedirectController {
  constructor(private readonly shortLinkService: ShortLinkService) {}

  @Get(':slug')
  async redirect(
    @Param('slug') slug: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const domain = request.hostname;

    try {
      const shortLink = await this.shortLinkService.resolveBySlug(domain, slug);

      await this.shortLinkService.queueClick(shortLink, {
        ip: this.resolveIp(request),
        userAgent: request.headers['user-agent'],
        referer: request.headers.referer,
        language: request.headers['accept-language'],
      });

      response.redirect(302, shortLink.destinationUrl);
    } catch {
      response.redirect(302, config.app.webAppUrl || FALLBACK_URL);
    }
  }

  private resolveIp(request: Request): string | undefined {
    const forwarded = request.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim();
    }

    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0];
    }

    return request.ip ?? request.socket?.remoteAddress ?? undefined;
  }
}

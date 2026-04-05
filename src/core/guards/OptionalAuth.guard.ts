import { auth } from 'core/auth';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';

import type { Request } from 'express';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
    } catch {
      // Optional auth should never block anonymous access.
    }

    return true;
  }
}

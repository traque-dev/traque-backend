import { auth } from 'core/auth';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';

import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    return !!session?.user;
  }
}

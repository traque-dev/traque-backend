import { ForbiddenException } from 'core/exceptions/Forbidden.exception';
import {
  compileAllowedRoutes,
  isAllowedRoute,
} from 'core/utils/compileAllowedRoutes';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { HttpRequestMethod } from 'models/types/HttpRequestMethod';

import type { Request } from 'express';

@Injectable()
export class AuthRouteGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthRouteGuard.name);

  private readonly allowedRoutes = compileAllowedRoutes([
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/get-session',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/sign-in/email',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/sign-out',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/reference',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/sign-up/email',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/create',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/organization/get-full-organization',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/set-active',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/organization/list',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/update-user',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/verify-email',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/sign-in/social',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/callback/google',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/check-slug',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/callback/apple',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/callback/apple',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/error',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/delete-user',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/sign-in/anonymous',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/invite-member',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/organization/list-invitations',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/cancel-invitation',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/organization/list-user-invitations',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/accept-invitation',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/reject-invitation',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/update-member-role',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/remove-member',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/send-verification-email',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/request-password-reset',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/reset-password',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/reset-password/:token',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/customer/subscriptions/list',
    },
    {
      method: HttpRequestMethod.GET,
      path: '/api/auth/customer/portal',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/checkout',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/polar/webhooks',
    },
    {
      method: HttpRequestMethod.POST,
      path: '/api/auth/organization/update',
    },
  ]);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (!isAllowedRoute(this.allowedRoutes, req)) {
      this.logger.error(
        `Received Forbidden Auth Resource Request ${req.method} ${req.url}`,
      );
      throw new ForbiddenException({ message: 'Forbidden' });
    }

    return true;
  }
}

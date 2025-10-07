import { auth } from 'core/auth';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';

import type { Request } from 'express';

export const AuthenticationPrincipal = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    return session;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { Request } from 'express';

/**
 * Returns authenticated User entity
 * */
export const Principal = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    // @ts-expect-error project type in Request
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request?.user;
  },
);

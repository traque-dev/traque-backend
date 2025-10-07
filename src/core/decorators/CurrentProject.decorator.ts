import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Project } from 'models/entity/Project.entity';

import type { Request } from 'express';

export const CurrentProject = createParamDecorator(
  (data: unknown, context: ExecutionContext): Project => {
    const request: Request = context.switchToHttp().getRequest();

    // @ts-expect-error project type in Request
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request?.project;
  },
);

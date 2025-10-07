import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentOrganization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request.organization;
  },
);

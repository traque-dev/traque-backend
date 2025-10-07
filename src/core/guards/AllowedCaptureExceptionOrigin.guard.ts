import { ForbiddenException } from 'core/exceptions/Forbidden.exception';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { Project } from 'models/entity/Project.entity';

import type { Request } from 'express';

@Injectable()
export class AllowedCaptureExceptionOriginGuard implements CanActivate {
  private readonly logger: Logger = new Logger(
    AllowedCaptureExceptionOriginGuard.name,
  );

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const origin = request.headers.origin || request.headers.referer;

    // @ts-expect-error Project field exists in request
    const project = request.project as Project;

    this.logger.log(
      `Verifying Is Origin "${origin}" Allowed For Project "${project.id}"`,
    );

    const { authorizedUrls } = project;

    if (origin && authorizedUrls) {
      if (!authorizedUrls.includes(origin)) {
        throw new ForbiddenException({
          message: 'Origin in now allowed',
        });
      }
    }

    return true;
  }
}

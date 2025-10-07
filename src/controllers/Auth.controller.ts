import { AuthRouteGuard } from 'core/guards/AuthRoute.guard';

import { All, Controller, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { match } from 'ts-pattern';

import { HttpRequestMethod } from 'models/types/HttpRequestMethod';
import { AuthService } from 'services/Auth.service';

import type { Request, Response } from 'express';

@ApiExcludeController()
@Controller('/auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  private readonly handler: ReturnType<typeof toNodeHandler>;

  constructor(private readonly authService: AuthService) {
    this.handler = toNodeHandler(this.authService.auth);
  }

  @UseGuards(AuthRouteGuard)
  @All('*path')
  async handle(@Req() req: Request, @Res() res: Response): Promise<any> {
    this.logger.log(`Received Auth Request: ${req.method} ${req.path}`);

    await this.preAuthApiHandling(req);

    return this.handler(req, res);
  }

  private async preAuthApiHandling(req: Request): Promise<void> {
    await match<[string, string]>([req.method, req.path])
      .with([HttpRequestMethod.POST, '/api/auth/sign-out'], async () => {
        await this.authService.handleSignOut(req);
      })
      .with([HttpRequestMethod.POST, '/api/auth/delete-user'], async () => {
        await this.authService.handleDeleteUser(req);
      })
      .otherwise(async () => {});
  }
}

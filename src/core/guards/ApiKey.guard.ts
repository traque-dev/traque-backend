import { UnauthorizedException } from 'core/exceptions/Unauthorized.exception';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from 'models/entity/Project.entity';

import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const apiKey: string = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException({
        message: 'API Key is required',
      });
    }

    const project = await this.projectRepo.findOne({
      where: {
        apiKey,
      },
    });

    if (!project) {
      throw new UnauthorizedException({
        message: 'Invalid API Key',
      });
    }

    return true;
  }
}

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from 'models/entity/Project.entity';

import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyProjectMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return next(); // If no API key is provided, proceed without modification
    }

    const project = await this.projectRepository.findOne({
      where: { apiKey },
      relations: {
        organization: true,
      },
    });

    if (!project) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Attach the project to the request object

    (req as any).project = project;

    next();
  }
}

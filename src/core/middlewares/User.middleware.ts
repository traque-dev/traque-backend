import { auth } from 'core/auth';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fromNodeHeaders } from 'better-auth/node';
import { Repository } from 'typeorm';

import { User } from 'models/entity/User.entity';

import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const headers = req.headers;

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (!session) return next();

    const user = await this.userRepo.findOne({
      where: {
        id: session.user.id,
      },
    });

    if (!user) return next();

    (req as any).user = user;

    next();
  }
}

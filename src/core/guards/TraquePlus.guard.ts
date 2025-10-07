import { config } from 'core/config';

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Subscription } from 'models/entity/Subscription.entity';

@Injectable()
export class TraquePlusGuard implements CanActivate {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (config.app.isSelfHosted) return true;

    const request: Request = context.switchToHttp().getRequest();

    // @ts-expect-error organization exists in request
    const organization = request?.organization as Organization;

    if (!organization) {
      throw new ForbiddenException({
        message: 'Not a Traque Plus organization',
      });
    }

    const plusSubscription = await this.subscriptionRepo.findOne({
      where: {
        referenceId: organization.id,
        status: In(['active', 'trialing']),
        plan: 'plus',
      },
    });

    if (!plusSubscription) {
      throw new ForbiddenException({
        message: 'Not a Traque Plus organization',
      });
    }

    return true;
  }
}

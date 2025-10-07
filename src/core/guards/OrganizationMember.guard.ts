import { BadRequestException } from 'core/exceptions/BadRequest.exception';
import { ForbiddenException } from 'core/exceptions/Forbidden.exception';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import qs from 'query-string';
import { isUUID } from 'class-validator';

import { OrganizationDTO } from 'models/dto/Organization.dto';
import { User } from 'models/entity/User.entity';
import { OrganizationService } from 'services/Organization.service';

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(private readonly organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // const query = qs.parse(request.url.split('?')[1]);

    const query = new URLSearchParams(request.url.split('?')[1]);

    // Get the authenticated user (attached by an earlier auth guard)
    // @ts-expect-error user exists in request object
    const user = request?.user as User;

    // Extract the organization id from the route parameters (e.g., /organizations/:organizationId)
    // or from query parameters (e.g., /exceptions?organizationId=1)
    const organizationId =
      // @ts-expect-error param exists in request
      (request?.params?.organizationId as OrganizationDTO['id']) ??
      (query?.get('organizationId') as OrganizationDTO['id']);

    if (!isUUID(organizationId, 4)) {
      throw new BadRequestException({
        message: 'Invalid organization ID',
      });
    }

    if (!user || !organizationId) {
      throw new ForbiddenException({
        message: 'Missing user credentials or organization ID in request.',
      });
    }

    const organization = await this.organizationService.getUserOrganizationById(
      user.id,
      organizationId,
    );

    if (!organization) {
      throw new ForbiddenException({
        message:
          "You don't have an access to this organization or this organization doesn't exist",
      });
    }

    // @ts-expect-error set organization in request
    request.organization = organization;

    return true;
  }
}

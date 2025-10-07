import { BadRequestException } from 'core/exceptions/BadRequest.exception';
import { ForbiddenException } from 'core/exceptions/Forbidden.exception';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';

import { ProjectDTO } from 'models/dto/Project.dto';
import { Organization } from 'models/entity/Organization.entity';
import { User } from 'models/entity/User.entity';
import { ProjectService } from 'services/Project.service';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly projectService: ProjectService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // const query = qs.parse(request.url.split('?')[1]);
    const query = new URLSearchParams(request.url.split('?')[1]);

    // Get the authenticated user (attached by an earlier auth guard)
    // @ts-expect-error user exists in request object
    const user = request?.user as User;

    // Extract the organization id from the route parameters or query parameters
    // @ts-expect-error organization exists in request
    const organization = request?.organization as Organization;

    // Extract the project id from the route parameters or query parameters
    const projectId =
      // @ts-expect-error param exists in request
      (request?.params?.projectId as ProjectDTO['id']) ??
      (query?.get('projectId') as ProjectDTO['id']);

    if (!isUUID(projectId, 4)) {
      throw new BadRequestException({
        message: 'Invalid project ID',
      });
    }

    if (!user || !organization || !projectId) {
      throw new ForbiddenException({
        message:
          'Missing user credentials, organization ID, or project ID in request.',
      });
    }

    // Then, verify the user has access to the project within that organization
    const project = await this.projectService.getUserProjectById(
      user,
      organization.id,
      projectId,
    );

    if (!project) {
      throw new ForbiddenException({
        message:
          "You don't have access to this project or this project doesn't exist",
      });
    }

    // @ts-expect-error set project in request
    request.project = project;

    return true;
  }
}

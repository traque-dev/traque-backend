import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import {
  createPageableParams,
  PageableDefault,
} from 'core/decorators/PageableDefault.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Controller, Get, Logger, Version } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { EventDto } from 'models/dto/Event.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Event } from 'models/entity/Event.entity';
import { Project } from 'models/entity/Project.entity';
import { EventService } from 'services/Event.service';

@ApiTags('Events')
@Controller('/organizations/:organizationId/projects/:projectId/events')
export class EventController {
  private readonly logger: Logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @ApiOperation({
    summary: 'Get events',
    description: 'Get all events for a project',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get()
  getEvents(
    @PageableDefault(
      createPageableParams<Event>({
        sortableColumns: ['createdAt', 'updatedAt', 'name'],
        defaultSortBy: {
          createdAt: 'DESC',
        },
      }),
    )
    pageable: Pageable<Event>,
    @CurrentProject() project: Project,
  ): Promise<PageDTO<EventDto>> {
    this.logger.log(
      `Received paginate events request with params: ${JSON.stringify({
        pageable,
      })}`,
    );

    return this.eventService.paginateEvents(project, pageable);
  }
}

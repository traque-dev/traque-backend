import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EventNotificationTriggerDto } from 'models/dto/EventNotificationTrigger.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { EventService } from 'services/Event.service';

@ApiTags('Event Notification Triggers')
@Controller(
  '/organizations/:organizationId/projects/:projectId/events/notification-triggers',
)
export class EventNotificationTriggerController {
  private readonly logger: Logger = new Logger(
    EventNotificationTriggerController.name,
  );

  constructor(private readonly eventService: EventService) {}

  @ApiOperation({
    summary: 'Get event notification triggers',
    description: 'Get all event notification triggers for a project',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [EventNotificationTriggerDto],
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get()
  getEventNotificationTriggers(
    @CurrentProject() project: Project,
  ): Promise<EventNotificationTriggerDto[]> {
    this.logger.log(
      `Received get event notification triggers request for project: ${project.id}`,
    );

    return this.eventService.getEventNotificationTriggers(project);
  }

  @ApiOperation({
    summary: 'Get event notification trigger by ID',
    description: 'Get a specific event notification trigger by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: EventNotificationTriggerDto,
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/:notificationTriggerId')
  getEventNotificationTriggerById(
    @CurrentProject() project: Project,
    @Param('notificationTriggerId', ParseUUIDPipe)
    notificationTriggerId: string,
  ): Promise<EventNotificationTriggerDto> {
    this.logger.log(
      `Received get event notification trigger by ID '${notificationTriggerId}' request for project: ${project.id}`,
    );

    return this.eventService.getEventNotificationTriggerById(
      project,
      notificationTriggerId,
    );
  }

  @ApiOperation({
    summary: 'Create event notification trigger',
    description: 'Create a new event notification trigger for a project',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: EventNotificationTriggerDto,
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post()
  createEventNotificationTrigger(
    @CurrentProject() project: Project,
    @Body() notificationTriggerDto: EventNotificationTriggerDto,
  ): Promise<EventNotificationTriggerDto> {
    this.logger.log(
      `Received create event notification trigger request for project: ${project.id}`,
    );

    return this.eventService.createEventNotificationTrigger(
      project,
      notificationTriggerDto,
    );
  }

  @ApiOperation({
    summary: 'Update event notification trigger',
    description: 'Update an existing event notification trigger',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: EventNotificationTriggerDto,
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/:notificationTriggerId')
  updateEventNotificationTrigger(
    @CurrentProject() project: Project,
    @Param('notificationTriggerId', ParseUUIDPipe)
    notificationTriggerId: string,
    @Body() notificationTriggerDto: EventNotificationTriggerDto,
  ): Promise<EventNotificationTriggerDto> {
    this.logger.log(
      `Received update event notification trigger '${notificationTriggerId}' request for project: ${project.id}`,
    );

    return this.eventService.updateEventNotificationTrigger(
      project,
      notificationTriggerId,
      notificationTriggerDto,
    );
  }

  @ApiOperation({
    summary: 'Delete event notification trigger',
    description: 'Delete an event notification trigger',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PositiveResponseDto,
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:notificationTriggerId')
  async deleteEventNotificationTrigger(
    @CurrentProject() project: Project,
    @Param('notificationTriggerId', ParseUUIDPipe)
    notificationTriggerId: string,
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received delete event notification trigger '${notificationTriggerId}' request for project: ${project.id}`,
    );

    await this.eventService.deleteEventNotificationTrigger(
      project,
      notificationTriggerId,
    );

    return PositiveResponseDto.instance();
  }
}

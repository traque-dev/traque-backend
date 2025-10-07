import { ApiKeyAuth } from 'core/decorators/ApiKeyAuth.decorator';
import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { RateLimit } from 'core/decorators/RateLimit.decorator';
import { AllowedCaptureExceptionOriginGuard } from 'core/guards/AllowedCaptureExceptionOrigin.guard';
import { dayjs } from 'core/utils/dayjs';

import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EventDto } from 'models/dto/Event.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { EventService } from 'services/Event.service';

@ApiTags('Events')
@Controller('/events')
export class EventCaptureController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({
    summary: 'Capture an event',
    description: 'Capture an event for a project',
  })
  @ApiResponse({ status: 200, type: PositiveResponseDto })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Public API key for the project',
    required: true,
  })
  @RateLimit({
    ttl: dayjs.duration({ seconds: 1 }).asMilliseconds(),
    limit: 50,
  })
  @Version('1')
  @UseGuards(AllowedCaptureExceptionOriginGuard)
  @ApiKeyAuth()
  @Post()
  async captureEvent(
    @Body() event: EventDto,
    @CurrentProject() project: Project,
  ): Promise<PositiveResponseDto> {
    await this.eventService.captureEvent(project, event);

    return PositiveResponseDto.instance();
  }
}

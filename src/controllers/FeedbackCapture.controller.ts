import { RateLimit } from 'core/decorators/RateLimit.decorator';
import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { dayjs } from 'core/utils/dayjs';

import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePublicFeedbackDTO } from 'models/dto/CreatePublicFeedback.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { FeedbackService } from 'services/Feedback.service';

@ApiTags('Feedback')
@Controller('/projects/:projectId/feedback')
export class FeedbackCaptureController {
  private readonly logger: Logger = new Logger(FeedbackCaptureController.name);

  constructor(
    private readonly feedbackService: FeedbackService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  @ApiOperation({
    summary: 'Submit public feedback',
    description:
      'Allows anyone to submit feedback for a project without authentication.',
  })
  @ApiResponse({ status: 200, type: PositiveResponseDto })
  @RateLimit({
    ttl: dayjs.duration({ minutes: 10 }).asMilliseconds(),
    limit: 3,
  })
  @Version('1')
  @Post('/')
  async submitFeedback(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreatePublicFeedbackDTO,
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received public feedback submission for project: ${projectId}`,
    );

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException({ message: 'Project not found' });
    }

    await this.feedbackService.createPublicFeedback(project, dto);

    return PositiveResponseDto.instance();
  }
}

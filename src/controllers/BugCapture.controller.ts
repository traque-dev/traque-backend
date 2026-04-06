import { ApiKeyAuth } from 'core/decorators/ApiKeyAuth.decorator';
import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { RateLimit } from 'core/decorators/RateLimit.decorator';
import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { AllowedCaptureExceptionOriginGuard } from 'core/guards/AllowedCaptureExceptionOrigin.guard';
import { dayjs } from 'core/utils/dayjs';

import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CaptureBugDTO } from 'models/dto/CaptureBug.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { BugService } from 'services/Bug.service';

@ApiTags('Bugs')
@Controller()
export class BugCaptureController {
  private readonly logger = new Logger(BugCaptureController.name);

  constructor(
    private readonly bugService: BugService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  @ApiOperation({
    summary: 'Report a bug using API Key',
    description: 'Capture a bug report using API Key',
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
  @Post('/bugs')
  async captureBug(
    @CurrentProject() project: Project,
    @Body() dto: CaptureBugDTO,
  ): Promise<PositiveResponseDto> {
    await this.bugService.captureBug(project, dto);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({
    summary: 'Report a bug by project ID',
    description: 'Submit a bug report for a project without authentication.',
  })
  @ApiResponse({ status: 201, type: PositiveResponseDto })
  @RateLimit({
    ttl: dayjs.duration({ minutes: 10 }).asMilliseconds(),
    limit: 5,
  })
  @Version('1')
  @Post('/projects/:projectId/bugs')
  async captureBugByProjectId(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CaptureBugDTO,
  ): Promise<PositiveResponseDto> {
    this.logger.log(`Received public bug submission for project: ${projectId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException({ message: 'Project not found' });
    }

    await this.bugService.captureBug(project, dto);

    return PositiveResponseDto.instance();
  }
}

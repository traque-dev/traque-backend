import { ApiKeyAuth } from 'core/decorators/ApiKeyAuth.decorator';
import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { RateLimit } from 'core/decorators/RateLimit.decorator';
import { AllowedCaptureExceptionOriginGuard } from 'core/guards/AllowedCaptureExceptionOrigin.guard';
import { dayjs } from 'core/utils/dayjs';

import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CaptureBugDTO } from 'models/dto/CaptureBug.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { BugService } from 'services/Bug.service';

@ApiTags('Bugs')
@Controller('/bugs')
export class BugCaptureController {
  constructor(private readonly bugService: BugService) {}

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
  @Post()
  async captureBug(
    @CurrentProject() project: Project,
    @Body() dto: CaptureBugDTO,
  ): Promise<PositiveResponseDto> {
    await this.bugService.captureBug(project, dto);

    return PositiveResponseDto.instance();
  }
}

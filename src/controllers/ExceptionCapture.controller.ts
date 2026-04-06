import { ApiKeyAuth } from 'core/decorators/ApiKeyAuth.decorator';
import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { AllowedCaptureExceptionOriginGuard } from 'core/guards/AllowedCaptureExceptionOrigin.guard';

import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ExceptionDTO } from 'models/dto/Exception.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { ExceptionService } from 'services/Exception.service';

@ApiTags('Exceptions')
@Controller('/exceptions')
export class ExceptionCaptureController {
  constructor(private readonly exceptionService: ExceptionService) {}

  @ApiResponse({ status: 200, type: PositiveResponseDto })
  @Version('1')
  @UseGuards(AllowedCaptureExceptionOriginGuard)
  @ApiKeyAuth()
  @Post()
  async captureException(
    @CurrentProject() project: Project,
    @Body() exceptionDTO: ExceptionDTO,
  ): Promise<PositiveResponseDto> {
    await this.exceptionService.captureException(project, exceptionDTO);

    return PositiveResponseDto.instance();
  }
}

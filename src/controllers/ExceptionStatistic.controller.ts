import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';

import {
  Controller,
  Get,
  Logger,
  ParseDatePipe,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DailyExceptionStatisticDto } from 'models/dto/DailyExceptionStatistic.dto';
import { Project } from 'models/entity/Project.entity';
import { ExceptionStatisticService } from 'services/ExceptionStatistic.service';

@ApiTags('Exception Statistics')
@Controller(
  '/organizations/:organizationId/projects/:projectId/exceptions/statistics',
)
export class ExceptionStatisticController {
  private readonly logger: Logger = new Logger(
    ExceptionStatisticController.name,
  );

  constructor(
    private readonly exceptionStatisticService: ExceptionStatisticService,
  ) {}

  @ApiOperation({
    summary: 'Get exceptions count per day',
    description:
      'Returns time series data for number of exceptions per day. Supports optional from/to date filters (ISO strings).',
  })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/daily')
  getDailyStatistic(
    @CurrentProject() project: Project,
    @Query('from', new ParseDatePipe({ optional: false })) from?: Date,
    @Query('to', new ParseDatePipe({ optional: false })) to?: Date,
  ): Promise<Array<DailyExceptionStatisticDto>> {
    this.logger.log(
      `Received exceptions per day request with params: ${JSON.stringify({
        from,
        to,
      })}`,
    );

    return this.exceptionStatisticService.getDailyStatistic(project, from, to);
  }
}

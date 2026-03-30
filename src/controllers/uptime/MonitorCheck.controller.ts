import { ApiResponsePage } from 'core/decorators/ApiResponsePage.decorator';
import { CurrentOrganization } from 'core/decorators/CurrentOrganization.decorator';
import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import {
  createPageableParams,
  PageableDefault,
} from 'core/decorators/PageableDefault.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Pageable } from 'core/interfaces/Pageable.interface';

import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDTO } from 'models/dto/Page.dto';
import { AvailabilityPeriodDTO } from 'models/dto/uptime/AvailabilityPeriod.dto';
import { MonitorCheckDTO } from 'models/dto/uptime/MonitorCheck.dto';
import { MonitorSummaryDTO } from 'models/dto/uptime/MonitorSummary.dto';
import { ResponseTimePointDTO } from 'models/dto/uptime/ResponseTimePoint.dto';
import { Organization } from 'models/entity/Organization.entity';
import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
import { MonitorRegion } from 'models/types/uptime/MonitorRegion';
import { MonitorService } from 'services/uptime/Monitor.service';
import { MonitorCheckService } from 'services/uptime/MonitorCheck.service';

@ApiTags('Uptime Monitor Checks')
@Controller('/organizations/:organizationId/uptime/monitors/:monitorId')
export class MonitorCheckController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly checkService: MonitorCheckService,
  ) {}

  @ApiOperation({ summary: 'Get check history for a monitor' })
  @ApiResponsePage(MonitorCheckDTO)
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/checks')
  async getChecks(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @PageableDefault(
      createPageableParams<MonitorCheck>({
        sortableColumns: ['checkedAt'],
        defaultSortBy: { checkedAt: 'DESC' },
      }),
    )
    pageable: Pageable<MonitorCheck>,
  ): Promise<PageDTO<MonitorCheckDTO>> {
    await this.monitorService.getMonitorById(organization, monitorId);

    return this.checkService.getChecks(monitorId, pageable);
  }

  @ApiOperation({
    summary: 'Get monitor summary (uptime duration, last check)',
  })
  @ApiResponse({ type: MonitorSummaryDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/summary')
  async getSummary(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
  ): Promise<MonitorSummaryDTO> {
    await this.monitorService.getMonitorById(organization, monitorId);

    return this.checkService.getSummary(monitorId);
  }

  @ApiOperation({ summary: 'Get response time series' })
  @ApiQuery({ name: 'region', enum: MonitorRegion, required: false })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month'],
    required: false,
  })
  @ApiResponse({ type: [ResponseTimePointDTO] })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/response-times')
  async getResponseTimes(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query('region') region?: MonitorRegion,
    @Query('period') period?: 'day' | 'week' | 'month',
  ): Promise<ResponseTimePointDTO[]> {
    await this.monitorService.getMonitorById(organization, monitorId);

    const periodDays = period === 'month' ? 30 : period === 'week' ? 7 : 1;

    return this.checkService.getResponseTimes(monitorId, region, periodDays);
  }

  @ApiOperation({ summary: 'Get availability stats' })
  @ApiResponse({ type: [AvailabilityPeriodDTO] })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/availability')
  async getAvailability(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<AvailabilityPeriodDTO[]> {
    await this.monitorService.getMonitorById(organization, monitorId);

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.checkService.getAvailability(monitorId, fromDate, toDate);
  }
}

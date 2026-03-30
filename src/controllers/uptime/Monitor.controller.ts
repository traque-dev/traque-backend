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
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDTO } from 'models/dto/Page.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { CreateMonitorDTO } from 'models/dto/uptime/CreateMonitor.dto';
import { MonitorDTO } from 'models/dto/uptime/Monitor.dto';
import { MonitorFilters } from 'models/dto/uptime/MonitorFilters.dto';
import { UpdateMonitorDTO } from 'models/dto/uptime/UpdateMonitor.dto';
import { Organization } from 'models/entity/Organization.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { MonitorService } from 'services/uptime/Monitor.service';

@ApiTags('Uptime Monitors')
@Controller('/organizations/:organizationId/uptime/monitors')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @ApiOperation({ summary: 'List monitors' })
  @ApiResponsePage(MonitorDTO)
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/')
  getMonitors(
    @CurrentOrganization() organization: Organization,
    @PageableDefault(
      createPageableParams<Monitor>({
        sortableColumns: ['createdAt', 'updatedAt', 'name', 'status'],
        defaultSortBy: { createdAt: 'DESC' },
      }),
    )
    pageable: Pageable<Monitor>,
    @Query() filters: MonitorFilters,
  ): Promise<PageDTO<MonitorDTO>> {
    return this.monitorService.getMonitors(organization, pageable, filters);
  }

  @ApiOperation({ summary: 'Get monitor by ID' })
  @ApiResponse({ type: MonitorDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/:monitorId')
  getMonitorById(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
  ): Promise<MonitorDTO> {
    return this.monitorService.getMonitorById(organization, monitorId);
  }

  @ApiOperation({ summary: 'Create a monitor' })
  @ApiResponse({ type: MonitorDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/')
  createMonitor(
    @CurrentOrganization() organization: Organization,
    @Body() dto: CreateMonitorDTO,
  ): Promise<MonitorDTO> {
    return this.monitorService.createMonitor(organization, dto);
  }

  @ApiOperation({ summary: 'Update a monitor' })
  @ApiResponse({ type: MonitorDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Patch('/:monitorId')
  updateMonitor(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
    @Body() dto: UpdateMonitorDTO,
  ): Promise<MonitorDTO> {
    return this.monitorService.updateMonitor(organization, monitorId, dto);
  }

  @ApiOperation({ summary: 'Delete a monitor' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Delete('/:monitorId')
  async deleteMonitor(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
  ): Promise<PositiveResponseDto> {
    await this.monitorService.deleteMonitor(organization, monitorId);

    return PositiveResponseDto.instance();
  }

  @ApiOperation({ summary: 'Pause a monitor' })
  @ApiResponse({ type: MonitorDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/:monitorId/pause')
  pauseMonitor(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
  ): Promise<MonitorDTO> {
    return this.monitorService.pauseMonitor(organization, monitorId);
  }

  @ApiOperation({ summary: 'Resume a monitor' })
  @ApiResponse({ type: MonitorDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/:monitorId/resume')
  resumeMonitor(
    @CurrentOrganization() organization: Organization,
    @Param('monitorId', ParseUUIDPipe) monitorId: string,
  ): Promise<MonitorDTO> {
    return this.monitorService.resumeMonitor(organization, monitorId);
  }
}

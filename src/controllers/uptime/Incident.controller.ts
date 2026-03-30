import { CurrentOrganization } from 'core/decorators/CurrentOrganization.decorator';
import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import {
  createPageableParams,
  PageableDefault,
} from 'core/decorators/PageableDefault.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';
import { Pageable } from 'core/interfaces/Pageable.interface';

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';

import { IncidentFilters } from 'models/dto/uptime/IncidentFilters.dto';
import { Organization } from 'models/entity/Organization.entity';
import { Incident } from 'models/entity/uptime/Incident.entity';
import { IncidentTimelineEntry } from 'models/entity/uptime/IncidentTimelineEntry.entity';
import { User } from 'models/entity/User.entity';
import { IncidentService } from 'services/uptime/Incident.service';

@ApiTags('Uptime Incidents')
@Controller('/organizations/:organizationId/uptime/incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @ApiOperation({ summary: 'List incidents' })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/')
  getIncidents(
    @CurrentOrganization() organization: Organization,
    @PageableDefault(
      createPageableParams<Incident>({
        sortableColumns: ['startedAt', 'createdAt', 'status'],
        defaultSortBy: { startedAt: 'DESC' },
      }),
    )
    pageable: Pageable<Incident>,
    @Query() filters: IncidentFilters,
  ): Promise<Pagination<Incident>> {
    return this.incidentService.getIncidents(organization, pageable, filters);
  }

  @ApiOperation({ summary: 'Get incident by ID' })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/:incidentId')
  getIncidentById(
    @CurrentOrganization() organization: Organization,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
  ): Promise<Incident> {
    return this.incidentService.getIncidentById(organization, incidentId);
  }

  @ApiOperation({ summary: 'Get incident timeline' })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/:incidentId/timeline')
  async getTimeline(
    @CurrentOrganization() organization: Organization,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @PageableDefault(
      createPageableParams<IncidentTimelineEntry>({
        sortableColumns: ['createdAt'],
        defaultSortBy: { createdAt: 'ASC' },
      }),
    )
    pageable: Pageable<IncidentTimelineEntry>,
  ): Promise<Pagination<IncidentTimelineEntry>> {
    await this.incidentService.getIncidentById(organization, incidentId);

    return this.incidentService.getTimeline(incidentId, pageable);
  }

  @ApiOperation({ summary: 'Acknowledge an incident' })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/:incidentId/acknowledge')
  acknowledgeIncident(
    @CurrentOrganization() organization: Organization,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Principal() user: User,
  ): Promise<Incident> {
    return this.incidentService.acknowledgeIncident(
      organization,
      incidentId,
      user,
    );
  }

  @ApiOperation({ summary: 'Resolve an incident' })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/:incidentId/resolve')
  resolveIncident(
    @CurrentOrganization() organization: Organization,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Principal() user: User,
  ): Promise<Incident> {
    return this.incidentService.resolveIncident(organization, incidentId, user);
  }

  @ApiOperation({ summary: 'Post a comment or post-mortem' })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/:incidentId/timeline')
  addComment(
    @CurrentOrganization() organization: Organization,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Principal() user: User,
    @Body('body') body: string,
  ): Promise<IncidentTimelineEntry> {
    return this.incidentService.addComment(
      organization,
      incidentId,
      user,
      body,
    );
  }
}

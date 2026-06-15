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
import { ShortLinkBreakdownItemDTO } from 'models/dto/shortlink/ShortLinkBreakdownItem.dto';
import { ShortLinkClickDTO } from 'models/dto/shortlink/ShortLinkClick.dto';
import { ShortLinkStatsDTO } from 'models/dto/shortlink/ShortLinkStats.dto';
import { ShortLinkTimePointDTO } from 'models/dto/shortlink/ShortLinkTimePoint.dto';
import { Organization } from 'models/entity/Organization.entity';
import { ShortLinkClick } from 'models/entity/shortlink/ShortLinkClick.entity';
import { ClickBreakdownDimension } from 'models/types/shortlink/ClickBreakdownDimension';
import { ClickTimePeriod } from 'models/types/shortlink/ClickTimePeriod';
import { ShortLinkService } from 'services/shortlink/ShortLink.service';
import { ShortLinkTrackingService } from 'services/shortlink/ShortLinkTracking.service';

@ApiTags('Short Link Analytics')
@Controller('/organizations/:organizationId/short-links/:shortLinkId')
export class ShortLinkTrackingController {
  constructor(
    private readonly shortLinkService: ShortLinkService,
    private readonly trackingService: ShortLinkTrackingService,
  ) {}

  @ApiOperation({ summary: 'List clicks for a short link' })
  @ApiResponsePage(ShortLinkClickDTO)
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/clicks')
  async getClicks(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
    @PageableDefault(
      createPageableParams<ShortLinkClick>({
        sortableColumns: ['clickedAt'],
        defaultSortBy: { clickedAt: 'DESC' },
      }),
    )
    pageable: Pageable<ShortLinkClick>,
  ): Promise<PageDTO<ShortLinkClickDTO>> {
    await this.shortLinkService.findShortLinkEntity(organization, shortLinkId);

    return this.trackingService.getClicks(shortLinkId, pageable);
  }

  @ApiOperation({ summary: 'Get aggregate click stats for a short link' })
  @ApiResponse({ type: ShortLinkStatsDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/stats')
  async getStats(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
  ): Promise<ShortLinkStatsDTO> {
    await this.shortLinkService.findShortLinkEntity(organization, shortLinkId);

    return this.trackingService.getStats(shortLinkId);
  }

  @ApiOperation({ summary: 'Get clicks over time' })
  @ApiQuery({ name: 'period', enum: ClickTimePeriod, required: false })
  @ApiResponse({ type: [ShortLinkTimePointDTO] })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/timeseries')
  async getTimeSeries(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
    @Query('period') period?: ClickTimePeriod,
  ): Promise<ShortLinkTimePointDTO[]> {
    await this.shortLinkService.findShortLinkEntity(organization, shortLinkId);

    return this.trackingService.getTimeSeries(shortLinkId, period);
  }

  @ApiOperation({
    summary: 'Get a click breakdown by dimension (country, referer, etc.)',
  })
  @ApiQuery({ name: 'dimension', enum: ClickBreakdownDimension })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ type: [ShortLinkBreakdownItemDTO] })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/breakdown')
  async getBreakdown(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
    @Query('dimension') dimension: ClickBreakdownDimension,
    @Query('limit') limit?: number,
  ): Promise<ShortLinkBreakdownItemDTO[]> {
    await this.shortLinkService.findShortLinkEntity(organization, shortLinkId);

    return this.trackingService.getBreakdown(
      shortLinkId,
      dimension ?? ClickBreakdownDimension.COUNTRY,
      limit ? Number(limit) : undefined,
    );
  }
}

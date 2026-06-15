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
import { CreateShortLinkDTO } from 'models/dto/shortlink/CreateShortLink.dto';
import { ShortLinkDTO } from 'models/dto/shortlink/ShortLink.dto';
import { ShortLinkFilters } from 'models/dto/shortlink/ShortLinkFilters.dto';
import { UpdateShortLinkDTO } from 'models/dto/shortlink/UpdateShortLink.dto';
import { Organization } from 'models/entity/Organization.entity';
import { ShortLink } from 'models/entity/shortlink/ShortLink.entity';
import { ShortLinkService } from 'services/shortlink/ShortLink.service';

@ApiTags('Short Links')
@Controller('/organizations/:organizationId/short-links')
export class ShortLinkController {
  constructor(private readonly shortLinkService: ShortLinkService) {}

  @ApiOperation({ summary: 'List short links' })
  @ApiResponsePage(ShortLinkDTO)
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/')
  getShortLinks(
    @CurrentOrganization() organization: Organization,
    @PageableDefault(
      createPageableParams<ShortLink>({
        sortableColumns: [
          'createdAt',
          'updatedAt',
          'slug',
          'clickCount',
          'lastClickedAt',
        ],
        defaultSortBy: { createdAt: 'DESC' },
      }),
    )
    pageable: Pageable<ShortLink>,
    @Query() filters: ShortLinkFilters,
  ): Promise<PageDTO<ShortLinkDTO>> {
    return this.shortLinkService.getShortLinks(organization, pageable, filters);
  }

  @ApiOperation({ summary: 'Get a short link by ID' })
  @ApiResponse({ type: ShortLinkDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/:shortLinkId')
  getShortLinkById(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
  ): Promise<ShortLinkDTO> {
    return this.shortLinkService.getShortLinkById(organization, shortLinkId);
  }

  @ApiOperation({ summary: 'Create a short link' })
  @ApiResponse({ type: ShortLinkDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/')
  createShortLink(
    @CurrentOrganization() organization: Organization,
    @Body() dto: CreateShortLinkDTO,
  ): Promise<ShortLinkDTO> {
    return this.shortLinkService.createShortLink(organization, dto);
  }

  @ApiOperation({ summary: 'Update a short link' })
  @ApiResponse({ type: ShortLinkDTO })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Patch('/:shortLinkId')
  updateShortLink(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
    @Body() dto: UpdateShortLinkDTO,
  ): Promise<ShortLinkDTO> {
    return this.shortLinkService.updateShortLink(
      organization,
      shortLinkId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete a short link' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Delete('/:shortLinkId')
  async deleteShortLink(
    @CurrentOrganization() organization: Organization,
    @Param('shortLinkId', ParseUUIDPipe) shortLinkId: string,
  ): Promise<PositiveResponseDto> {
    await this.shortLinkService.deleteShortLink(organization, shortLinkId);

    return PositiveResponseDto.instance();
  }
}

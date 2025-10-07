import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';

import {
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OrganizationDTO } from 'models/dto/Organization.dto';
import { User } from 'models/entity/User.entity';
import { OrganizationMapper } from 'models/mappers/Organization.mapper';
import { OrganizationService } from 'services/Organization.service';

@ApiTags('Organizations')
@Controller('/organizations')
export class OrganizationController {
  private readonly logger: Logger = new Logger(OrganizationController.name);

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly mapper: OrganizationMapper,
  ) {}

  @Version('1')
  @PreAuthorize()
  @Get('/')
  getOrganizations(@Principal() user: User): Promise<OrganizationDTO[]> {
    this.logger.log(`Received get organizations request for user: ${user.id}`);

    return this.organizationService.getUserOrganizations(user);
  }

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/:organizationId')
  async getOrganizationById(
    @Principal() user: User,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ): Promise<OrganizationDTO> {
    this.logger.log(`Received get organizations request for user: ${user.id}`);

    return this.mapper.toDTO(
      await this.organizationService.getUserOrganizationById(
        user.id,
        organizationId,
      ),
    );
  }
}

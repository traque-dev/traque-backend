import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';

import { Body, Controller, Logger, Param, Post, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateApiKeyDTO } from 'models/dto/CreateApiKey.dto';
import { ApiKey } from 'models/entity/ApiKey.entity';
import { User } from 'models/entity/User.entity';
import { ApiKeyService } from 'services/ApiKey.service';

@ApiTags('API Keys')
@Controller('/organizations/:organizationId/api-keys')
export class ApiKeyController {
  private readonly logger: Logger = new Logger(ApiKeyController.name);

  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post()
  createApiKey(
    @Param('organizationId') organizationId: string,
    @Principal() user: User,
    @Body() createApiKeyDTO: CreateApiKeyDTO,
  ): Promise<ApiKey> {
    this.logger.log(
      `Received Create API Key Request for Organization: ${organizationId}. Creator: ${user.id}`,
    );

    return this.apiKeyService.createApiKey(
      user,
      organizationId,
      createApiKeyDTO,
    );
  }
}

import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';

import {
  Controller,
  Get,
  Logger,
  Param,
  ParseBoolPipe,
  Query,
  Version,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SubscriptionDTO } from 'models/dto/Subscription.dto';
import { SubscriptionMapper } from 'models/mappers/Subscription.mapper';
import { SubscriptionService } from 'services/Subscription.service';

@ApiTags('Subscriptions')
@Controller('/billing/subscriptions')
export class SubscriptionController {
  private readonly logger: Logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly mapper: SubscriptionMapper,
  ) {}

  @ApiQuery({
    name: 'active',
    type: 'boolean',
    required: false,
    description: 'Whether to return active subscriptions',
  })
  @ApiResponse({
    type: SubscriptionDTO,
    isArray: true,
  })
  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/:organizationId')
  async getSubscriptions(
    @Param('organizationId') organizationId: string,
    @Query('active', ParseBoolPipe) active: boolean,
  ): Promise<SubscriptionDTO[]> {
    this.logger.log(
      `Received get subscriptions request for organization: ${organizationId}`,
    );

    const subscriptions = await this.subscriptionService.getSubscriptions(
      organizationId,
      active,
    );

    return subscriptions.map((subscription) => this.mapper.toDTO(subscription));
  }
}

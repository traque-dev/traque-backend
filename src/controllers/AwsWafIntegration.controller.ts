import { OrganizationMemberOnly } from 'core/decorators/OrganizationMemberOnly.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  ParseUUIDPipe,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AwsWafCredentialsDTO } from 'models/dto/AwsWafCredentials.dto';
import { OrganizationDTO } from 'models/dto/Organization.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { User } from 'models/entity/User.entity';
import { AwsWafService } from 'services/integrations/aws/waf/AwsWaf.service';

@ApiTags('AWS WAF Integration')
@Controller('/integrations/aws/waf')
export class AwsWafIntegrationController {
  private readonly logger: Logger = new Logger(
    AwsWafIntegrationController.name,
  );

  constructor(private readonly awsWafService: AwsWafService) {}

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Get('/credentials')
  getCredentials(
    @Principal() user: User,
    @Query('organizationId', ParseUUIDPipe)
    organizationId: OrganizationDTO['id'],
  ): Promise<AwsWafCredentialsDTO> {
    this.logger.log(
      `Received get AWS WAF credentials request by user: ${user.id}`,
    );

    return this.awsWafService.getCredentials(organizationId);
  }

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Post('/credentials')
  async setCredentials(
    @Principal() user: User,
    @Query('organizationId', ParseUUIDPipe)
    organizationId: OrganizationDTO['id'],
    @Body() awsWafCredentialsDTO: AwsWafCredentialsDTO,
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received set AWS WAF credentials request by user: ${user.id}`,
    );

    await this.awsWafService.setCredentials(
      organizationId,
      awsWafCredentialsDTO,
    );

    return PositiveResponseDto.instance();
  }

  @Version('1')
  @PreAuthorize()
  @OrganizationMemberOnly()
  @Delete('/credentials')
  async deleteCredentials(
    @Principal() user: User,
    @Query('organizationId', ParseUUIDPipe)
    organizationId: OrganizationDTO['id'],
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received delete AWS WAF credentials request by user: ${user.id}`,
    );

    await this.awsWafService.deleteCredentials(organizationId);

    return PositiveResponseDto.instance();
  }
}

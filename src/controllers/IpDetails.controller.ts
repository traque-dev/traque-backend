import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';
import { ParseIPPipe } from 'core/pipes/ParseIP.pipe';

import { Controller, Get, Logger, Param, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IpAddressDTO } from 'models/dto/IpAddress.dto';
import { User } from 'models/entity/User.entity';
import { IpAddressMapper } from 'models/mappers/IpAddress.mapper';
import { IpDetailsService } from 'services/IpDetails.service';

@ApiTags('IP Details')
@Controller('/ip-details')
export class IpDetailsController {
  private readonly logger: Logger = new Logger(IpDetailsController.name);

  constructor(
    private readonly ipDetailsService: IpDetailsService,
    private readonly ipAddressMapper: IpAddressMapper,
  ) {}

  @Version('1')
  @PreAuthorize()
  @Get('/:ip')
  async getIpDetails(
    @Principal() user: User,
    @Param('ip', ParseIPPipe) ip: string,
  ): Promise<IpAddressDTO> {
    this.logger.log(
      `Received Get IP Address "${ip}" Details by User ${user.id}`,
    );

    return this.ipAddressMapper.toDTO(
      await this.ipDetailsService.getIpDetails(ip),
    );
  }
}

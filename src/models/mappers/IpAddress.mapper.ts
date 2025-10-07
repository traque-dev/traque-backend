import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { IpAddressDTO } from 'models/dto/IpAddress.dto';
import { IpAddress } from 'models/entity/IpAddress.entity';

@Injectable()
export class IpAddressMapper implements BaseMapper<IpAddress, IpAddressDTO> {
  toDTO(entity: IpAddress): IpAddressDTO {
    return new IpAddressDTO({
      city: entity.city,
      country: entity.country,
      ip: entity.ip,
      location: entity.location,
      organization: entity.organization,
      postalCode: entity.postalCode,
      region: entity.region,
      timezone: entity.timezone,
    });
  }

  toEntity(dto: IpAddressDTO): IpAddress {
    return new IpAddress({
      city: dto.city,
      country: dto.country,
      ip: dto.ip,
      location: dto.location,
      organization: dto.organization,
      postalCode: dto.postalCode,
      region: dto.region,
      timezone: dto.timezone,
    });
  }
}

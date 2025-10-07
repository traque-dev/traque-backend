import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { OrganizationDTO } from 'models/dto/Organization.dto';
import { Organization } from 'models/entity/Organization.entity';

@Injectable()
export class OrganizationMapper
  implements BaseMapper<Organization, OrganizationDTO>
{
  toDTO(entity: Organization): OrganizationDTO {
    return new OrganizationDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      logo: entity.logo,
      metadata: entity.metadata,
      name: entity.name,
      slug: entity.slug,
    });
  }

  toEntity(): Organization | Promise<Organization> {
    throw new Error('Method not implemented.');
  }
}

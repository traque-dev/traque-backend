import { ForbiddenException } from 'core/exceptions/Forbidden.exception';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationDTO } from 'models/dto/Organization.dto';
import { Member } from 'models/entity/Member.entity';
import { Organization } from 'models/entity/Organization.entity';
import { User } from 'models/entity/User.entity';
import { OrganizationMapper } from 'models/mappers/Organization.mapper';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    private readonly organizationMapper: OrganizationMapper,
  ) {}

  public async getUserOrganizations(user: User): Promise<OrganizationDTO[]> {
    const organizationMember = await this.memberRepo.find({
      where: {
        user,
      },
      relations: {
        organization: true,
      },
    });

    return organizationMember.map((m) =>
      this.organizationMapper.toDTO(m.organization),
    );
  }

  public async getUserOrganizationById(
    userId: User['id'],
    organizationId: OrganizationDTO['id'],
  ): Promise<Organization> {
    const organizationMember = await this.memberRepo.findOne({
      where: {
        user: {
          id: userId,
        },
        organization: {
          id: organizationId,
        },
      },
      relations: {
        organization: true,
      },
    });

    if (!organizationMember) {
      throw new ForbiddenException({
        message:
          "You don't have an access to this organization or this organization doesn't exist",
      });
    }

    return organizationMember.organization;
  }
}

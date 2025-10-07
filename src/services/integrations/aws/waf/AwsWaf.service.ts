import { ConflictException } from 'core/exceptions/Conflict.exception';
import { NotFoundException } from 'core/exceptions/NotFound.exception';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AwsWafCredentialsDTO } from 'models/dto/AwsWafCredentials.dto';
import { OrganizationDTO } from 'models/dto/Organization.dto';
import { AwsWafCredentials } from 'models/entity/integrations/aws/waf/AwsWafCredentials.entity';
import { Organization } from 'models/entity/Organization.entity';
import { AwsWafCredentialsMapper } from 'models/mappers/AwsWafCredentials.mapper';

@Injectable()
export class AwsWafService {
  constructor(
    @InjectRepository(AwsWafCredentials)
    private readonly awsWafCredsRepo: Repository<AwsWafCredentials>,
    private readonly awsWafCredentialsMapper: AwsWafCredentialsMapper,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  public async getCredentials(
    organizationId: OrganizationDTO['id'],
  ): Promise<AwsWafCredentialsDTO> {
    const creds = await this.awsWafCredsRepo.findOne({
      where: {
        organization: {
          id: organizationId,
        },
      },
    });

    if (!creds) {
      throw new NotFoundException({
        message: "Integration with AWS WAF doesn't exist",
      });
    }

    return this.awsWafCredentialsMapper.toDTO(creds);
  }

  public async setCredentials(
    organizationId: OrganizationDTO['id'],
    awsWafCredentialsDTO: AwsWafCredentialsDTO,
  ): Promise<void> {
    const organization = await this.organizationRepo.findOne({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException({
        message: 'Organization is not provided',
      });
    }

    const existingCreds = await this.awsWafCredsRepo.findOne({
      where: {
        organization: {
          id: organizationId,
        },
      },
    });

    if (existingCreds) {
      throw new ConflictException({
        message: 'Credentials already exist',
      });
    }

    await this.awsWafCredsRepo.save(
      this.awsWafCredentialsMapper
        .toEntity(awsWafCredentialsDTO)
        .forOrganization(organization),
    );
  }

  async deleteCredentials(organizationId: OrganizationDTO['id']) {
    const existingCreds = await this.awsWafCredsRepo.findOne({
      where: {
        organization: {
          id: organizationId,
        },
      },
    });

    if (!existingCreds) {
      throw new NotFoundException({
        message: 'Credentials not found',
      });
    }

    await this.awsWafCredsRepo.delete(existingCreds.id);
  }
}

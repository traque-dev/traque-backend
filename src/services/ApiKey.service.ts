import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { UnauthorizedException } from 'core/exceptions/Unauthorized.exception';
import { base64Url } from 'core/utils/base64';
import { dayjs } from 'core/utils/dayjs';
import { createHash } from 'core/utils/hash';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateApiKeyDTO } from 'models/dto/CreateApiKey.dto';
import { ApiKey } from 'models/entity/ApiKey.entity';
import { Organization } from 'models/entity/Organization.entity';
import { User } from 'models/entity/User.entity';

type GenerateKeyParams = {
  prefix: string;
  length: number;
};

interface IApiKeyService {
  createApiKey(
    user: User,
    organizationId: Organization['id'],
    createApiKeyDTO: CreateApiKeyDTO,
  ): Promise<ApiKey>;

  verifyApiKey(
    key: string,
    permissions?: Record<string, string[]>,
  ): Promise<boolean>;

  generateKey(params: GenerateKeyParams): string;
}

@Injectable()
export class ApiKeyService implements IApiKeyService {
  public readonly prefix = 'trq';

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  async createApiKey(
    user: User,
    organizationId: Organization['id'],
    { name }: CreateApiKeyDTO,
  ): Promise<ApiKey> {
    const organization = await this.organizationRepo.findOne({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException({
        message: ' Organization does not exist',
      });
    }

    const key = this.generateKey({
      length: 64,
      prefix: this.prefix,
    });

    const hash = await createHash('SHA-256').digest(key);

    const hashedKey = base64Url.encode(hash, {
      padding: false,
    });

    const start: string = key.substring(0, 8);

    const expiresAt = dayjs().add(6, 'months').toDate();

    const apiKey = new ApiKey({
      name,
      user,
      organization,
      prefix: this.prefix,
      start: start,
      key: hashedKey,
      enabled: true,
      expiresAt,
      lastRefillAt: null,
      lastRequest: null,
      metadata: null,
      rateLimitMax: null,
      rateLimitTimeWindow: null,
      remaining: null,
      refillAmount: null,
      refillInterval: null,
      rateLimitEnabled: true,
      requestCount: 0,
      permissions: null,
      rawKey: key,
    });

    return this.apiKeyRepo.save(apiKey);
  }

  async verifyApiKey(
    key: string,
    permissions?: Record<string, string[]>,
  ): Promise<boolean> {
    const hash = await createHash('SHA-256').digest(
      new TextEncoder().encode(key),
    );
    const hashed = base64Url.encode(new Uint8Array(hash), {
      padding: false,
    });

    const apiKey = await this.apiKeyRepo.findOne({
      where: {
        key: hashed,
      },
    });

    if (!apiKey) {
      throw new UnauthorizedException({
        message: 'API key not found',
      });
    }

    if (!apiKey.enabled) {
      throw new UnauthorizedException({
        message: 'API key is disabled',
      });
    }

    if (apiKey.expiresAt) {
      const now = dayjs();
      if (now.isAfter(apiKey.expiresAt)) {
        await this.apiKeyRepo.delete(apiKey.id);

        throw new UnauthorizedException({
          message: 'API key has expired',
        });
      }
    }

    if (permissions) {
      console.log('TODO permissions');
    }

    return true;
  }

  generateKey({ length, prefix }: GenerateKeyParams): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    let apiKey = prefix ? `${prefix}_` : '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      apiKey += characters[randomIndex];
    }

    return apiKey;
  }
}

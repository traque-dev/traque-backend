import { config } from 'core/config';
import { InternalServerErrorException } from 'core/exceptions/InternalServerError.exception';
import { IpInfoResponse } from 'core/types/IpInfoResponse';
import { isIpInfoResponse } from 'core/utils/isIpInfoResponse';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { IpAddress } from 'models/entity/IpAddress.entity';

@Injectable()
export class IpDetailsService {
  constructor(
    @InjectRepository(IpAddress)
    private readonly ipAddressRepo: Repository<IpAddress>,
    private readonly httpService: HttpService,
  ) {}

  public async getIpDetails(ip: string): Promise<IpAddress> {
    const obtainedIpDetails = await this.ipAddressRepo.findOne({
      where: {
        ip,
      },
    });

    if (obtainedIpDetails) return obtainedIpDetails;

    const { data } = await firstValueFrom(
      this.httpService.get<IpInfoResponse>(`https://ipinfo.io/${ip}`, {
        headers: {
          Authorization: `Bearer ${config.ipinfo.apiKey}`,
        },
      }),
    );

    if (!isIpInfoResponse(data)) {
      throw new InternalServerErrorException({
        message: 'IP Address could not be accessed',
      });
    }

    const ipAddress = new IpAddress({
      city: data.city,
      country: data.country,
      ip: data.ip,
      location: data.loc,
      organization: data.org,
      postalCode: data.postal,
      region: data.region,
      timezone: data.timezone,
    });

    return this.ipAddressRepo.save(ipAddress);
  }
}

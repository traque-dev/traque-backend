import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { AwsWafCredentialsDTO } from 'models/dto/AwsWafCredentials.dto';
import { AwsWafCredentials } from 'models/entity/integrations/aws/waf/AwsWafCredentials.entity';

@Injectable()
export class AwsWafCredentialsMapper
  implements BaseMapper<AwsWafCredentials, AwsWafCredentialsDTO>
{
  toDTO(entity: AwsWafCredentials): AwsWafCredentialsDTO {
    return new AwsWafCredentialsDTO({
      region: entity.region,
      accessKeyId: entity.accessKeyId,
      secretAccessKey: entity.secretAccessKey,
    });
  }

  toEntity(dto: AwsWafCredentialsDTO): AwsWafCredentials {
    return new AwsWafCredentials({
      region: dto.region,
      accessKeyId: dto.accessKeyId,
      secretAccessKey: dto.secretAccessKey,
    });
  }
}

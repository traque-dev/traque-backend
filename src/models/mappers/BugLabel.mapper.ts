import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { BugLabelDTO } from 'models/dto/BugLabel.dto';
import { BugLabel } from 'models/entity/BugLabel.entity';

@Injectable()
export class BugLabelMapper implements BaseMapper<BugLabel, BugLabelDTO> {
  toDTO(entity: BugLabel): BugLabelDTO {
    return new BugLabelDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      color: entity.color,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntity(dto: BugLabelDTO): BugLabel | Promise<BugLabel> {
    throw new Error('Method not implemented.');
  }
}

import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';

import { BugReproductionStepDTO } from 'models/dto/BugReproductionStep.dto';
import { BugReproductionStep } from 'models/entity/BugReproductionStep.entity';

@Injectable()
export class BugReproductionStepMapper
  implements BaseMapper<BugReproductionStep, BugReproductionStepDTO>
{
  toDTO(entity: BugReproductionStep): BugReproductionStepDTO {
    return new BugReproductionStepDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      order: entity.order,
      description: entity.description,
    });
  }

  toEntity(
    dto: BugReproductionStepDTO,
  ): BugReproductionStep | Promise<BugReproductionStep> {
    throw new Error('Method not implemented.');
  }
}

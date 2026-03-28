import { NotFoundException } from 'core/exceptions/NotFound.exception';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { BugReproductionStepDTO } from 'models/dto/BugReproductionStep.dto';
import { CreateBugReproductionStepDTO } from 'models/dto/CreateBugReproductionStep.dto';
import { ReorderBugReproductionStepsDTO } from 'models/dto/ReorderBugReproductionSteps.dto';
import { UpdateBugReproductionStepDTO } from 'models/dto/UpdateBugReproductionStep.dto';
import { Bug } from 'models/entity/Bug.entity';
import { BugReproductionStep } from 'models/entity/BugReproductionStep.entity';
import { BugReproductionStepMapper } from 'models/mappers/BugReproductionStep.mapper';

@Injectable()
export class BugReproductionStepService {
  constructor(
    @InjectRepository(BugReproductionStep)
    private readonly stepRepository: Repository<BugReproductionStep>,
    private readonly stepMapper: BugReproductionStepMapper,
  ) {}

  async getSteps(bugId: string): Promise<BugReproductionStepDTO[]> {
    const steps = await this.stepRepository.find({
      where: { bug: { id: bugId } },
      order: { order: 'ASC' },
    });

    return steps.map((step) => this.stepMapper.toDTO(step));
  }

  async createStep(
    bug: Bug,
    dto: CreateBugReproductionStepDTO,
  ): Promise<BugReproductionStepDTO> {
    const step = new BugReproductionStep({
      description: dto.description,
      order: dto.order,
    });

    step.bug = bug;

    const saved = await this.stepRepository.save(step);

    return this.stepMapper.toDTO(saved);
  }

  async updateStep(
    bugId: string,
    stepId: string,
    dto: UpdateBugReproductionStepDTO,
  ): Promise<BugReproductionStepDTO> {
    const step = await this.stepRepository.findOne({
      where: { id: stepId, bug: { id: bugId } },
    });

    if (!step) {
      throw new NotFoundException({ message: 'Reproduction step not found' });
    }

    if (dto.description !== undefined) step.description = dto.description;
    if (dto.order !== undefined) step.order = dto.order;

    const saved = await this.stepRepository.save(step);

    return this.stepMapper.toDTO(saved);
  }

  async deleteStep(bugId: string, stepId: string): Promise<void> {
    const step = await this.stepRepository.findOne({
      where: { id: stepId, bug: { id: bugId } },
    });

    if (!step) {
      throw new NotFoundException({ message: 'Reproduction step not found' });
    }

    await this.stepRepository.remove(step);
  }

  async reorderSteps(
    bugId: string,
    dto: ReorderBugReproductionStepsDTO,
  ): Promise<BugReproductionStepDTO[]> {
    const stepIds = dto.steps.map((s) => s.id);

    const steps = await this.stepRepository.find({
      where: { id: In(stepIds), bug: { id: bugId } },
    });

    const orderMap = new Map(dto.steps.map((s) => [s.id, s.order]));

    for (const step of steps) {
      const newOrder = orderMap.get(step.id);
      if (newOrder !== undefined) {
        step.order = newOrder;
      }
    }

    await this.stepRepository.save(steps);

    return this.getSteps(bugId);
  }
}

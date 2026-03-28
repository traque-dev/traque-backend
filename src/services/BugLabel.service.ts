import { NotFoundException } from 'core/exceptions/NotFound.exception';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BugLabelDTO } from 'models/dto/BugLabel.dto';
import { CreateBugLabelDTO } from 'models/dto/CreateBugLabel.dto';
import { UpdateBugLabelDTO } from 'models/dto/UpdateBugLabel.dto';
import { BugLabel } from 'models/entity/BugLabel.entity';
import { Project } from 'models/entity/Project.entity';
import { BugLabelMapper } from 'models/mappers/BugLabel.mapper';

@Injectable()
export class BugLabelService {
  constructor(
    @InjectRepository(BugLabel)
    private readonly labelRepository: Repository<BugLabel>,
    private readonly labelMapper: BugLabelMapper,
  ) {}

  async getLabels(project: Project): Promise<BugLabelDTO[]> {
    const labels = await this.labelRepository.find({
      where: { project: { id: project.id } },
      order: { name: 'ASC' },
    });

    return labels.map((label) => this.labelMapper.toDTO(label));
  }

  async getLabelById(project: Project, labelId: string): Promise<BugLabel> {
    const label = await this.labelRepository.findOne({
      where: { id: labelId, project: { id: project.id } },
    });

    if (!label) {
      throw new NotFoundException({ message: 'Label not found' });
    }

    return label;
  }

  async createLabel(
    project: Project,
    dto: CreateBugLabelDTO,
  ): Promise<BugLabelDTO> {
    const label = new BugLabel({
      name: dto.name,
      color: dto.color,
    });

    label.project = project;

    const saved = await this.labelRepository.save(label);

    return this.labelMapper.toDTO(saved);
  }

  async updateLabel(
    project: Project,
    labelId: string,
    dto: UpdateBugLabelDTO,
  ): Promise<BugLabelDTO> {
    const label = await this.getLabelById(project, labelId);

    if (dto.name !== undefined) label.name = dto.name;
    if (dto.color !== undefined) label.color = dto.color;

    const saved = await this.labelRepository.save(label);

    return this.labelMapper.toDTO(saved);
  }

  async deleteLabel(project: Project, labelId: string): Promise<void> {
    const label = await this.getLabelById(project, labelId);

    await this.labelRepository.remove(label);
  }
}

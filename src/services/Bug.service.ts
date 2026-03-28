import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { BugDTO } from 'models/dto/Bug.dto';
import { CaptureBugDTO } from 'models/dto/CaptureBug.dto';
import { CreateBugDTO } from 'models/dto/CreateBug.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { UpdateBugDTO } from 'models/dto/UpdateBug.dto';
import { Bug } from 'models/entity/Bug.entity';
import { BugLabel } from 'models/entity/BugLabel.entity';
import { BugReproductionStep } from 'models/entity/BugReproductionStep.entity';
import { Exception } from 'models/entity/Exception.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { BugFilters } from 'models/filters/Bug.filter';
import { BugMapper } from 'models/mappers/Bug.mapper';
import { BugActivityType } from 'models/types/BugActivityType';
import { BugPriority } from 'models/types/BugPriority';
import { BugSource } from 'models/types/BugSource';
import { BugStatus } from 'models/types/BugStatus';
import { BugActivityService } from 'services/BugActivity.service';

@Injectable()
export class BugService {
  constructor(
    @InjectRepository(Bug)
    private readonly bugRepository: Repository<Bug>,
    @InjectRepository(Exception)
    private readonly exceptionRepository: Repository<Exception>,
    @InjectRepository(BugLabel)
    private readonly labelRepository: Repository<BugLabel>,
    private readonly bugMapper: BugMapper,
    private readonly activityService: BugActivityService,
  ) {}

  async createBug(
    project: Project,
    reporter: User,
    dto: CreateBugDTO,
  ): Promise<BugDTO> {
    const bug = new Bug({
      title: dto.title,
      description: dto.description,
      status: BugStatus.OPEN,
      priority: dto.priority,
      environment: dto.environment,
      expectedBehavior: dto.expectedBehavior,
      actualBehavior: dto.actualBehavior,
      source: BugSource.DASHBOARD,
    });

    bug.project = project;
    bug.reporter = reporter;

    if (dto.exceptionId) {
      const exception = await this.exceptionRepository.findOne({
        where: { id: dto.exceptionId, project: { id: project.id } },
      });

      if (exception) {
        bug.exception = exception;
      }
    }

    if (dto.steps?.length) {
      bug.steps = dto.steps.map(
        (s) =>
          new BugReproductionStep({
            description: s.description,
            order: s.order,
          }),
      );
    }

    const saved = await this.bugRepository.save(bug);

    return this.getBugById(project, saved.id);
  }

  async captureBug(project: Project, dto: CaptureBugDTO): Promise<void> {
    const bug = new Bug({
      title: dto.title,
      description: dto.description,
      status: BugStatus.OPEN,
      priority: dto.priority ?? BugPriority.MEDIUM,
      environment: dto.environment,
      expectedBehavior: dto.expectedBehavior,
      actualBehavior: dto.actualBehavior,
      browserContext: dto.browserContext as Record<string, any>,
      serverContext: dto.serverContext as Record<string, any>,
      breadcrumbs: dto.breadcrumbs as Record<string, any>[],
      metadata: dto.metadata,
      source: dto.source ?? BugSource.SDK,
    });

    bug.project = project;

    if (dto.exceptionId) {
      const exception = await this.exceptionRepository.findOne({
        where: { id: dto.exceptionId, project: { id: project.id } },
      });

      if (exception) {
        bug.exception = exception;
      }
    }

    if (dto.steps?.length) {
      bug.steps = dto.steps.map(
        (s) =>
          new BugReproductionStep({
            description: s.description,
            order: s.order,
          }),
      );
    }

    await this.bugRepository.save(bug);
  }

  async paginateBugs(
    project: Project,
    { page, size, sort }: Pageable<Bug>,
    filters: BugFilters,
  ): Promise<PageDTO<BugDTO>> {
    const sortableColumnMap: Partial<Record<keyof Bug, string>> = {
      createdAt: 'bug.created_at',
      updatedAt: 'bug.updated_at',
      title: 'bug.title',
      status: 'bug.status',
      priority: 'bug.priority',
    };

    const queryBuilder = this.bugRepository
      .createQueryBuilder('bug')
      .leftJoinAndSelect('bug.reporter', 'reporter')
      .leftJoinAndSelect('bug.assignee', 'assignee')
      .leftJoinAndSelect('bug.exception', 'exception')
      .leftJoinAndSelect('bug.labels', 'labels')
      .leftJoinAndSelect('bug.steps', 'steps')
      .where('bug.project_id = :projectId', { projectId: project.id });

    if (filters.status) {
      queryBuilder.andWhere('bug.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('bug.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.source) {
      queryBuilder.andWhere('bug.source = :source', { source: filters.source });
    }

    if (filters.assigneeId) {
      queryBuilder.andWhere('bug.assignee_id = :assigneeId', {
        assigneeId: filters.assigneeId,
      });
    }

    if (filters.labelId) {
      queryBuilder.andWhere('labels.id = :labelId', {
        labelId: filters.labelId,
      });
    }

    if (sort && Object.keys(sort).length > 0) {
      for (const [field, direction] of Object.entries(sort)) {
        const column = sortableColumnMap[field as keyof Bug];
        if (column) {
          queryBuilder.addOrderBy(column, direction as 'ASC' | 'DESC');
        }
      }
    } else {
      queryBuilder.orderBy('bug.created_at', 'DESC');
    }

    const pagination = await paginate(queryBuilder, { page, limit: size });

    return this.bugMapper.mapToPage(pagination);
  }

  async getBugById(project: Project, bugId: string): Promise<BugDTO> {
    const bug = await this.bugRepository.findOne({
      where: { id: bugId, project: { id: project.id } },
      relations: {
        reporter: true,
        assignee: true,
        exception: true,
        labels: true,
        steps: true,
      },
    });

    if (!bug) {
      throw new NotFoundException({ message: 'Bug not found' });
    }

    return this.bugMapper.toDTO(bug);
  }

  async updateBug(
    project: Project,
    bugId: string,
    dto: UpdateBugDTO,
  ): Promise<BugDTO> {
    const bug = await this.bugRepository.findOne({
      where: { id: bugId, project: { id: project.id } },
    });

    if (!bug) {
      throw new NotFoundException({ message: 'Bug not found' });
    }

    if (dto.title !== undefined) bug.title = dto.title;
    if (dto.description !== undefined) bug.description = dto.description;
    if (dto.environment !== undefined) bug.environment = dto.environment;
    if (dto.expectedBehavior !== undefined)
      bug.expectedBehavior = dto.expectedBehavior;
    if (dto.actualBehavior !== undefined)
      bug.actualBehavior = dto.actualBehavior;

    await this.bugRepository.save(bug);

    return this.getBugById(project, bugId);
  }

  async changeBugStatus(
    project: Project,
    bugId: string,
    status: BugStatus,
    actor: User,
  ): Promise<void> {
    const bug = await this.findBugOrThrow(project, bugId);
    const oldStatus = bug.status;

    await this.bugRepository.update(
      { id: bugId, project: { id: project.id } },
      { status },
    );

    await this.activityService.record(
      bug,
      BugActivityType.STATUS_CHANGED,
      actor,
      oldStatus,
      status,
    );
  }

  async changeBugPriority(
    project: Project,
    bugId: string,
    priority: BugPriority,
    actor: User,
  ): Promise<void> {
    const bug = await this.findBugOrThrow(project, bugId);
    const oldPriority = bug.priority;

    await this.bugRepository.update(
      { id: bugId, project: { id: project.id } },
      { priority },
    );

    await this.activityService.record(
      bug,
      BugActivityType.PRIORITY_CHANGED,
      actor,
      oldPriority,
      priority,
    );
  }

  async assignBug(
    project: Project,
    bugId: string,
    assigneeId: string | undefined,
    actor: User,
  ): Promise<void> {
    const bug = await this.bugRepository.findOne({
      where: { id: bugId, project: { id: project.id } },
      relations: { assignee: true },
    });

    if (!bug) {
      throw new NotFoundException({ message: 'Bug not found' });
    }

    const oldAssignee = bug.assignee?.id;

    if (assigneeId) {
      await this.bugRepository.update(
        { id: bugId },
        { assignee: { id: assigneeId } },
      );
    } else {
      bug.assignee = undefined;
      await this.bugRepository.save(bug);
    }

    await this.activityService.record(
      bug,
      BugActivityType.ASSIGNEE_CHANGED,
      actor,
      oldAssignee,
      assigneeId,
    );
  }

  async addLabel(
    project: Project,
    bugId: string,
    labelId: string,
    actor: User,
  ): Promise<void> {
    const bug = await this.bugRepository.findOne({
      where: { id: bugId, project: { id: project.id } },
      relations: { labels: true },
    });

    if (!bug) {
      throw new NotFoundException({ message: 'Bug not found' });
    }

    const label = await this.labelRepository.findOne({
      where: { id: labelId, project: { id: project.id } },
    });

    if (!label) {
      throw new NotFoundException({ message: 'Label not found' });
    }

    const alreadyHas = bug.labels?.some((l) => l.id === labelId);
    if (!alreadyHas) {
      bug.labels = [...(bug.labels ?? []), label];
      await this.bugRepository.save(bug);

      await this.activityService.record(
        bug,
        BugActivityType.LABEL_ADDED,
        actor,
        undefined,
        label.name,
      );
    }
  }

  async removeLabel(
    project: Project,
    bugId: string,
    labelId: string,
    actor: User,
  ): Promise<void> {
    const bug = await this.bugRepository.findOne({
      where: { id: bugId, project: { id: project.id } },
      relations: { labels: true },
    });

    if (!bug) {
      throw new NotFoundException({ message: 'Bug not found' });
    }

    const label = bug.labels?.find((l) => l.id === labelId);
    if (label) {
      bug.labels = (bug.labels ?? []).filter((l) => l.id !== labelId);
      await this.bugRepository.save(bug);

      await this.activityService.record(
        bug,
        BugActivityType.LABEL_REMOVED,
        actor,
        label.name,
        undefined,
      );
    }
  }

  async deleteBug(project: Project, bugId: string): Promise<void> {
    const bug = await this.findBugOrThrow(project, bugId);

    await this.bugRepository.remove(bug);
  }

  async getStatistics(project: Project): Promise<{
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const bugs = await this.bugRepository.find({
      where: { project: { id: project.id } },
      select: ['status', 'priority'],
    });

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const bug of bugs) {
      byStatus[bug.status] = (byStatus[bug.status] ?? 0) + 1;
      byPriority[bug.priority] = (byPriority[bug.priority] ?? 0) + 1;
    }

    return { byStatus, byPriority };
  }

  async findBugOrThrow(project: Project, bugId: string): Promise<Bug> {
    const bug = await this.bugRepository.findOne({
      where: { id: bugId, project: { id: project.id } },
    });

    if (!bug) {
      throw new NotFoundException({ message: 'Bug not found' });
    }

    return bug;
  }
}

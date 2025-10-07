import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { FindOptionsWhere, Repository } from 'typeorm';

import { IssueDTO } from 'models/dto/Issue.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Exception } from 'models/entity/Exception.entity';
import { Issue } from 'models/entity/Issue.entity';
import { Project } from 'models/entity/Project.entity';
import { IssueFilters } from 'models/filters/Issue.filter';
import { IssueMapper } from 'models/mappers/Issue.mapper';
import { IssueSeverity } from 'models/types/IssueSeverity';
import { IssueStatus } from 'models/types/IssueStatus';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(Exception)
    private readonly exceptionRepository: Repository<Exception>,
    private readonly issueMapper: IssueMapper,
  ) {}

  async createOrUpdateIssueFromException(
    exception: Exception,
    project: Project,
  ) {
    const obtainedIssue = await this.getIssueForProjectByException(
      project,
      exception,
    );

    if (!obtainedIssue) {
      const newIssue = new Issue({
        project,
        eventCount: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        name: exception.name,
        severity: IssueSeverity.MEDIUM,
        status: IssueStatus.OPEN,
      });

      const savedIssue = await this.issueRepository.save(newIssue);

      await this.exceptionRepository.update(exception.id, {
        issue: savedIssue,
      });

      return savedIssue;
    }

    await this.exceptionRepository.update(exception.id, {
      issue: obtainedIssue,
    });

    await this.issueRepository.update(obtainedIssue.id, {
      eventCount: Number(obtainedIssue.eventCount) + 1,
      lastSeen: new Date(),
      status: IssueStatus.OPEN,
    });

    return this.getIssueForProjectByException(project, exception);
  }

  getIssueForProjectByException(project: Project, exception: Exception) {
    return this.issueRepository.findOne({
      where: {
        project: {
          id: project.id,
        },
        name: exception.name,
      },
    });
  }

  async paginateProjectIssues(
    project: Project,
    { page, size, sort }: Pageable<Issue>,
    filters: IssueFilters,
  ): Promise<PageDTO<IssueDTO>> {
    const where: FindOptionsWhere<Issue> = {
      project: {
        id: project.id,
      },
    };

    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;

    const pagination = await paginate(
      this.issueRepository,
      {
        page,
        limit: size,
      },
      {
        where,
        order: sort,
      },
    );

    return this.issueMapper.mapToPage(pagination);
  }

  async getIssueById(
    project: Project,
    issueId: IssueDTO['id'],
  ): Promise<IssueDTO> {
    const issue = await this.issueRepository.findOne({
      where: {
        id: issueId,
        project: {
          id: project.id,
        },
      },
    });

    if (!issue) {
      throw new NotFoundException({
        message: "Issue doesn't exist",
      });
    }

    return this.issueMapper.toDTO(issue);
  }

  async changeIssueStatus(
    project: Project,
    issueId: IssueDTO['id'],
    status: IssueStatus,
  ): Promise<void> {
    const issue = await this.getIssueById(project, issueId);

    if (!issue) {
      throw new NotFoundException({
        message: "Issue doesn't exist",
      });
    }

    await this.issueRepository.update(
      {
        id: issueId,
        project: {
          id: project.id,
        },
      },
      {
        status,
      },
    );
  }

  async changeIssueSeverity(
    project: Project,
    issueId: IssueDTO['id'],
    severity: IssueSeverity,
  ): Promise<void> {
    const issue = await this.getIssueById(project, issueId);

    if (!issue) {
      throw new NotFoundException({
        message: "Issue doesn't exist",
      });
    }

    await this.issueRepository.update(
      {
        id: issueId,
        project: {
          id: project.id,
        },
      },
      {
        severity,
      },
    );
  }
}

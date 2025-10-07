import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { ExceptionDTO } from 'models/dto/Exception.dto';
import { IssueDTO } from 'models/dto/Issue.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Exception } from 'models/entity/Exception.entity';
import { Project } from 'models/entity/Project.entity';
import { ExceptionCreatedEvent } from 'models/events/ExceptionCreated.event';
import { ExceptionMapper } from 'models/mappers/Exception.mapper';
import { IssueService } from 'services/Issue.service';

@Injectable()
export class ExceptionService {
  constructor(
    private readonly exceptionMapper: ExceptionMapper,
    @InjectRepository(Exception)
    private readonly exceptionRepo: Repository<Exception>,
    private readonly evenEmitter: EventEmitter2,
    private readonly issueService: IssueService,
  ) {}

  public async captureException(
    project: Project,
    exceptionDTO: ExceptionDTO,
  ): Promise<ExceptionDTO> {
    const newException = this.exceptionMapper
      .toEntity(exceptionDTO)
      .forProject(project);

    if (!newException.platform && project.platform) {
      newException.platform = project.platform;
    }

    const savedException = await this.exceptionRepo.save(newException);

    await this.issueService.createOrUpdateIssueFromException(
      savedException,
      project,
    );

    this.evenEmitter.emit(
      ExceptionCreatedEvent.eventName,
      new ExceptionCreatedEvent({
        exception: savedException,
      }),
    );

    return this.exceptionMapper.toDTO(savedException);
  }

  async paginateExceptions(
    project: Project,
    { page, size, sort }: Pageable<Exception>,
    issueId?: IssueDTO['id'],
  ): Promise<PageDTO<ExceptionDTO>> {
    const exceptions = await paginate(
      this.exceptionRepo,
      {
        page,
        limit: size,
      },
      {
        where: {
          project: {
            id: project.id,
          },
          issue: {
            id: issueId,
          },
        },
        order: sort,
      },
    );

    return this.exceptionMapper.mapToPage(exceptions);
  }

  async getExceptionById(
    project: Project,
    exceptionId: ExceptionDTO['id'],
  ): Promise<ExceptionDTO> {
    const exception = await this.exceptionRepo.findOne({
      where: {
        id: exceptionId,
        project: {
          id: project.id,
        },
      },
      relations: {
        httpContext: true,
        frames: true,
      },
      order: {
        frames: {
          frameIndex: 'ASC',
        },
      },
    });

    if (!exception) {
      throw new NotFoundException({
        message: 'Exception is not found',
      });
    }

    return this.exceptionMapper.toDTO(exception);
  }
}

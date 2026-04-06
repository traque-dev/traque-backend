import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { In, Repository } from 'typeorm';

import { CreateFeedbackDTO } from 'models/dto/CreateFeedback.dto';
import { CreatePublicFeedbackDTO } from 'models/dto/CreatePublicFeedback.dto';
import { FeedbackDTO } from 'models/dto/Feedback.dto';
import { FeedbackStatisticsDTO } from 'models/dto/FeedbackStatistics.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { UpdateFeedbackDTO } from 'models/dto/UpdateFeedback.dto';
import { Feedback } from 'models/entity/Feedback.entity';
import { FeedbackFile } from 'models/entity/FeedbackFile.entity';
import { File } from 'models/entity/File.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackCreatedEvent } from 'models/events/FeedbackCreated.event';
import { FeedbackFilters } from 'models/filters/Feedback.filter';
import { FeedbackMapper } from 'models/mappers/Feedback.mapper';
import { FileMapper } from 'models/mappers/File.mapper';
import { FeedbackActivityType } from 'models/types/FeedbackActivityType';
import { FeedbackPriority } from 'models/types/FeedbackPriority';
import { FeedbackSource } from 'models/types/FeedbackSource';
import { FeedbackStatus } from 'models/types/FeedbackStatus';
import { FilePurpose } from 'models/types/FilePurpose';
import { FeedbackActivityService } from 'services/FeedbackActivity.service';
import { FileService } from 'services/File.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(FeedbackFile)
    private readonly feedbackFileRepository: Repository<FeedbackFile>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly feedbackMapper: FeedbackMapper,
    private readonly fileMapper: FileMapper,
    private readonly fileService: FileService,
    private readonly activityService: FeedbackActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createFeedback(
    project: Project,
    reporter: User,
    dto: CreateFeedbackDTO,
  ): Promise<FeedbackDTO> {
    const feedback = new Feedback({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: FeedbackStatus.NEW,
      priority: dto.priority,
      source: FeedbackSource.DASHBOARD,
    });

    feedback.project = project;
    feedback.reporter = reporter;

    const saved = await this.feedbackRepository.save(feedback);

    if (dto.fileIds?.length) {
      await this.attachFilesByIds(saved, dto.fileIds);
    }

    this.eventEmitter.emit(
      FeedbackCreatedEvent.eventName,
      new FeedbackCreatedEvent({ feedback: saved }),
    );

    return this.getFeedbackById(project, saved.id);
  }

  async createPublicFeedback(
    project: Project,
    dto: CreatePublicFeedbackDTO,
  ): Promise<void> {
    const feedback = new Feedback({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: FeedbackStatus.NEW,
      priority: FeedbackPriority.MEDIUM,
      source: FeedbackSource.PUBLIC,
      submitterName: dto.submitterName,
      submitterEmail: dto.submitterEmail,
    });

    feedback.project = project;

    const saved = await this.feedbackRepository.save(feedback);

    if (dto.fileIds?.length) {
      await this.attachFilesByIds(saved, dto.fileIds);
    }

    this.eventEmitter.emit(
      FeedbackCreatedEvent.eventName,
      new FeedbackCreatedEvent({ feedback: saved }),
    );
  }

  private async attachFilesByIds(
    feedback: Feedback,
    fileIds: string[],
  ): Promise<void> {
    const files = await this.fileRepository.find({
      where: { id: In(fileIds), purpose: FilePurpose.FEEDBACK },
    });

    await Promise.all(
      files.map(async (file) => {
        const feedbackFile = this.feedbackFileRepository.create();
        feedbackFile.feedback = feedback;
        feedbackFile.file = file;
        await this.feedbackFileRepository.save(feedbackFile);
      }),
    );
  }

  async paginateFeedback(
    project: Project,
    { page, size, sort }: Pageable<Feedback>,
    filters: FeedbackFilters,
  ): Promise<PageDTO<FeedbackDTO>> {
    const sortableColumnMap: Partial<Record<keyof Feedback, string>> = {
      createdAt: 'feedback.created_at',
      updatedAt: 'feedback.updated_at',
      title: 'feedback.title',
      status: 'feedback.status',
      priority: 'feedback.priority',
      type: 'feedback.type',
    };

    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.reporter', 'reporter')
      .leftJoinAndSelect('feedback.assignee', 'assignee')
      .where('feedback.project_id = :projectId', { projectId: project.id });

    if (filters.status) {
      queryBuilder.andWhere('feedback.status = :status', {
        status: filters.status,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('feedback.type = :type', { type: filters.type });
    }

    if (filters.priority) {
      queryBuilder.andWhere('feedback.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.source) {
      queryBuilder.andWhere('feedback.source = :source', {
        source: filters.source,
      });
    }

    if (filters.assigneeId) {
      queryBuilder.andWhere('feedback.assignee_id = :assigneeId', {
        assigneeId: filters.assigneeId,
      });
    }

    if (sort && Object.keys(sort).length > 0) {
      for (const [field, direction] of Object.entries(sort)) {
        const column = sortableColumnMap[field as keyof Feedback];
        if (column) {
          queryBuilder.addOrderBy(column, direction as 'ASC' | 'DESC');
        }
      }
    } else {
      queryBuilder.orderBy('feedback.created_at', 'DESC');
    }

    const pagination = await paginate(queryBuilder, { page, limit: size });

    return this.feedbackMapper.mapToPage(pagination);
  }

  async getFeedbackById(
    project: Project,
    feedbackId: string,
  ): Promise<FeedbackDTO> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId, project: { id: project.id } },
      relations: {
        reporter: true,
        assignee: true,
        files: { file: true },
      },
    });

    if (!feedback) {
      throw new NotFoundException({ message: 'Feedback not found' });
    }

    const dto = this.feedbackMapper.toDTO(feedback);

    if (feedback.files?.length) {
      dto.files = await Promise.all(
        feedback.files.map(async (ff) => {
          const url = await this.fileService.generatePresignedUrl(ff.file.key);
          return this.fileMapper.toDTO(ff.file, url);
        }),
      );
    }

    return dto;
  }

  async findFeedbackOrThrow(
    project: Project,
    feedbackId: string,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId, project: { id: project.id } },
    });

    if (!feedback) {
      throw new NotFoundException({ message: 'Feedback not found' });
    }

    return feedback;
  }

  async updateFeedback(
    project: Project,
    feedbackId: string,
    dto: UpdateFeedbackDTO,
  ): Promise<FeedbackDTO> {
    const feedback = await this.findFeedbackOrThrow(project, feedbackId);

    if (dto.title !== undefined) feedback.title = dto.title;
    if (dto.description !== undefined) feedback.description = dto.description;
    if (dto.impact !== undefined) feedback.impact = dto.impact;

    await this.feedbackRepository.save(feedback);

    return this.getFeedbackById(project, feedbackId);
  }

  async changeFeedbackStatus(
    project: Project,
    feedbackId: string,
    status: FeedbackStatus,
    actor: User,
  ): Promise<void> {
    const feedback = await this.findFeedbackOrThrow(project, feedbackId);
    const oldStatus = feedback.status;

    await this.feedbackRepository.update(
      { id: feedbackId, project: { id: project.id } },
      { status },
    );

    await this.activityService.record(
      feedback,
      FeedbackActivityType.STATUS_CHANGED,
      actor,
      oldStatus,
      status,
    );
  }

  async changeFeedbackPriority(
    project: Project,
    feedbackId: string,
    priority: FeedbackPriority,
    actor: User,
  ): Promise<void> {
    const feedback = await this.findFeedbackOrThrow(project, feedbackId);
    const oldPriority = feedback.priority;

    await this.feedbackRepository.update(
      { id: feedbackId, project: { id: project.id } },
      { priority },
    );

    await this.activityService.record(
      feedback,
      FeedbackActivityType.PRIORITY_CHANGED,
      actor,
      oldPriority,
      priority,
    );
  }

  async assignFeedback(
    project: Project,
    feedbackId: string,
    assigneeId: string | undefined,
    actor: User,
  ): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId, project: { id: project.id } },
      relations: { assignee: true },
    });

    if (!feedback) {
      throw new NotFoundException({ message: 'Feedback not found' });
    }

    const oldAssignee = feedback.assignee?.id;

    if (assigneeId) {
      await this.feedbackRepository.update(
        { id: feedbackId },
        { assignee: { id: assigneeId } },
      );
    } else {
      feedback.assignee = undefined;
      await this.feedbackRepository.save(feedback);
    }

    await this.activityService.record(
      feedback,
      FeedbackActivityType.ASSIGNEE_CHANGED,
      actor,
      oldAssignee,
      assigneeId,
    );
  }

  async deleteFeedback(project: Project, feedbackId: string): Promise<void> {
    const feedback = await this.findFeedbackOrThrow(project, feedbackId);

    await this.feedbackRepository.remove(feedback);
  }

  async getStatistics(project: Project): Promise<FeedbackStatisticsDTO> {
    const items = await this.feedbackRepository.find({
      where: { project: { id: project.id } },
      select: ['status', 'type', 'priority'],
    });

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
      byType[item.type] = (byType[item.type] ?? 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] ?? 0) + 1;
    }

    return new FeedbackStatisticsDTO({ byStatus, byType, byPriority });
  }
}

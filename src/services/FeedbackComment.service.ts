import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { CreateFeedbackCommentDTO } from 'models/dto/CreateFeedbackComment.dto';
import { FeedbackCommentDTO } from 'models/dto/FeedbackComment.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { UpdateFeedbackCommentDTO } from 'models/dto/UpdateFeedbackComment.dto';
import { Feedback } from 'models/entity/Feedback.entity';
import { FeedbackComment } from 'models/entity/FeedbackComment.entity';
import { User } from 'models/entity/User.entity';
import { FeedbackCommentMapper } from 'models/mappers/FeedbackComment.mapper';
import { FeedbackActivityType } from 'models/types/FeedbackActivityType';
import { FeedbackActivityService } from 'services/FeedbackActivity.service';

@Injectable()
export class FeedbackCommentService {
  constructor(
    @InjectRepository(FeedbackComment)
    private readonly commentRepository: Repository<FeedbackComment>,
    private readonly commentMapper: FeedbackCommentMapper,
    private readonly activityService: FeedbackActivityService,
  ) {}

  async paginateComments(
    feedbackId: string,
    { page, size, sort }: Pageable<FeedbackComment>,
  ): Promise<PageDTO<FeedbackCommentDTO>> {
    const pagination = await paginate(
      this.commentRepository,
      { page, limit: size },
      {
        where: { feedback: { id: feedbackId } },
        relations: { author: true, parent: true },
        order: sort ?? { createdAt: 'ASC' },
      },
    );

    return this.commentMapper.mapToPage(pagination);
  }

  async createComment(
    feedback: Feedback,
    author: User,
    dto: CreateFeedbackCommentDTO,
  ): Promise<FeedbackCommentDTO> {
    const comment = new FeedbackComment({ body: dto.body });

    comment.feedback = feedback;
    comment.author = author;

    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: dto.parentId, feedback: { id: feedback.id } },
      });

      if (!parent) {
        throw new NotFoundException({ message: 'Parent comment not found' });
      }

      comment.parent = parent;
    }

    const saved = await this.commentRepository.save(comment);

    await this.activityService.record(
      feedback,
      FeedbackActivityType.COMMENT_ADDED,
      author,
      undefined,
      saved.id,
    );

    const result = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: { author: true, parent: true },
    });

    return this.commentMapper.toDTO(result!);
  }

  async updateComment(
    feedbackId: string,
    commentId: string,
    author: User,
    dto: UpdateFeedbackCommentDTO,
  ): Promise<FeedbackCommentDTO> {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        feedback: { id: feedbackId },
        author: { id: author.id },
      },
      relations: { author: true, parent: true },
    });

    if (!comment) {
      throw new NotFoundException({ message: 'Comment not found' });
    }

    comment.body = dto.body;

    const saved = await this.commentRepository.save(comment);

    return this.commentMapper.toDTO(saved);
  }

  async deleteComment(
    feedbackId: string,
    commentId: string,
    author: User,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        feedback: { id: feedbackId },
        author: { id: author.id },
      },
    });

    if (!comment) {
      throw new NotFoundException({ message: 'Comment not found' });
    }

    await this.commentRepository.remove(comment);
  }
}

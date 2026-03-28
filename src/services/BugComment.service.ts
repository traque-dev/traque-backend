import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { BugCommentDTO } from 'models/dto/BugComment.dto';
import { CreateBugCommentDTO } from 'models/dto/CreateBugComment.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { UpdateBugCommentDTO } from 'models/dto/UpdateBugComment.dto';
import { Bug } from 'models/entity/Bug.entity';
import { BugComment } from 'models/entity/BugComment.entity';
import { User } from 'models/entity/User.entity';
import { BugCommentMapper } from 'models/mappers/BugComment.mapper';
import { BugActivityType } from 'models/types/BugActivityType';
import { BugActivityService } from 'services/BugActivity.service';

@Injectable()
export class BugCommentService {
  constructor(
    @InjectRepository(BugComment)
    private readonly commentRepository: Repository<BugComment>,
    private readonly commentMapper: BugCommentMapper,
    private readonly activityService: BugActivityService,
  ) {}

  async paginateComments(
    bugId: string,
    { page, size, sort }: Pageable<BugComment>,
  ): Promise<PageDTO<BugCommentDTO>> {
    const pagination = await paginate(
      this.commentRepository,
      { page, limit: size },
      {
        where: { bug: { id: bugId } },
        relations: { author: true, parent: true },
        order: sort ?? { createdAt: 'ASC' },
      },
    );

    return this.commentMapper.mapToPage(pagination);
  }

  async createComment(
    bug: Bug,
    author: User,
    dto: CreateBugCommentDTO,
  ): Promise<BugCommentDTO> {
    const comment = new BugComment({ body: dto.body });

    comment.bug = bug;
    comment.author = author;

    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: dto.parentId, bug: { id: bug.id } },
      });

      if (!parent) {
        throw new NotFoundException({ message: 'Parent comment not found' });
      }

      comment.parent = parent;
    }

    const saved = await this.commentRepository.save(comment);

    await this.activityService.record(
      bug,
      BugActivityType.COMMENT_ADDED,
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
    bugId: string,
    commentId: string,
    author: User,
    dto: UpdateBugCommentDTO,
  ): Promise<BugCommentDTO> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, bug: { id: bugId }, author: { id: author.id } },
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
    bugId: string,
    commentId: string,
    author: User,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, bug: { id: bugId }, author: { id: author.id } },
    });

    if (!comment) {
      throw new NotFoundException({ message: 'Comment not found' });
    }

    await this.commentRepository.remove(comment);
  }
}

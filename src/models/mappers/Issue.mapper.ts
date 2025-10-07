import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';

import { IssueDTO } from 'models/dto/Issue.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { Issue } from 'models/entity/Issue.entity';

@Injectable()
export class IssueMapper implements BaseMapper<Issue, IssueDTO> {
  toDTO(entity: Issue): IssueDTO {
    return new IssueDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      eventCount: entity.eventCount,
      firstSeen: entity.firstSeen,
      lastSeen: entity.lastSeen,
      name: entity.name,
      severity: entity.severity,
      status: entity.status,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntity(dto: IssueDTO): Issue | Promise<Issue> {
    throw new Error('Method not implemented.');
  }

  mapToPage(
    paginationEntity: Pagination<Issue, IPaginationMeta>,
  ): PageDTO<IssueDTO> {
    return new PageDTO<IssueDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

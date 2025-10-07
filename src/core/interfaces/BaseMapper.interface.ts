import { Pagination } from 'nestjs-typeorm-paginate';

import { PageDTO } from 'models/dto/Page.dto';

export interface BaseMapper<Entity = unknown, DTO = unknown> {
  toDTO(entity: Entity): DTO | Promise<DTO>;
  toEntity(dto: DTO): Entity | Promise<Entity>;

  mapToPage?(paginationEntity: Pagination<Entity>): PageDTO<DTO>;
}

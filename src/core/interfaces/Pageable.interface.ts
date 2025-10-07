import { FindOptionsOrder } from 'typeorm';

export interface Pageable<Entity> {
  size: number;
  page: number;
  sort?: FindOptionsOrder<Entity>;
}

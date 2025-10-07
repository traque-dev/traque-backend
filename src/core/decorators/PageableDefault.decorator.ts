import { NotAcceptableException } from 'core/exceptions/NotAcceptable.exception';
import { Pageable } from 'core/interfaces/Pageable.interface';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { set } from 'lodash';
import { FindOptionsOrder } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';

type PageableParams<Entity = any> = {
  sortableColumns?: (keyof Entity)[];
  defaultSortBy?: FindOptionsOrder<Entity>;
};

export function createPageableParams<Entity extends BaseEntity>(
  params: PageableParams<Entity>,
): PageableParams<Entity> {
  return params;
}

export const PageableDefault = createParamDecorator<PageableParams>(
  (data: PageableParams, ctx: ExecutionContext): Pageable<any> => {
    const request = ctx.switchToHttp().getRequest();

    const { page = 1, size = 10 } = request.query;

    const sortString = request.query.sort as string;

    let sort: FindOptionsOrder<any> | undefined =
      data?.defaultSortBy ?? undefined;
    if (sortString && !!data?.sortableColumns?.length) {
      const { sortableColumns } = data;

      const sortPattern = /^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?):(asc|desc)$/i;

      if (!sortString.match(sortPattern)) {
        throw new NotAcceptableException({
          message: 'Invalid sort parameter, allowed ASC or DESC',
        });
      }

      const [property, direction] = sortString.split(':');

      if (!sortableColumns.includes(property)) {
        throw new NotAcceptableException({
          message: `Invalid sort property: ${property}, allowed: [${sortableColumns?.join(',')}]`,
        });
      }

      sort = set({}, property, direction);
    }

    return {
      page: +page,
      size: +size,
      sort,
    };
  },
);

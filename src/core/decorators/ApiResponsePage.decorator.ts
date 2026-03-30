import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiResponsePage = <T>(type: Type<T>) =>
  applyDecorators(
    ApiExtraModels(type),
    ApiOkResponse({
      schema: {
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(type) },
          },
          meta: {
            type: 'object',
            properties: {
              currentPage: { type: 'number' },
              itemCount: { type: 'number' },
              itemsPerPage: { type: 'number' },
              totalItems: { type: 'number' },
              totalPages: { type: 'number' },
            },
            required: [
              'currentPage',
              'itemCount',
              'itemsPerPage',
              'totalItems',
              'totalPages',
            ],
          },
        },
        required: ['items', 'meta'],
      },
    }),
  );

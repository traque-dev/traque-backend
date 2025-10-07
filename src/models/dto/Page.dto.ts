import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IPaginationMeta } from 'nestjs-typeorm-paginate/dist/interfaces';

class PageMeta implements IPaginationMeta {
  @ApiProperty()
  @IsNumber()
  currentPage: number;

  @ApiProperty()
  @IsNumber()
  itemCount: number;

  @ApiProperty()
  @IsNumber()
  itemsPerPage: number;

  @ApiProperty()
  @IsNumber()
  totalItems: number;

  @ApiProperty()
  @IsNumber()
  totalPages: number;
}

export class PageDTO<Dto> extends Pagination<Dto> {
  @ApiProperty()
  override items: Dto[];

  @ApiProperty()
  override meta: PageMeta;
}

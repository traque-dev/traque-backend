import { ExtractEntityProps } from 'core/types/ExtractEntityProps';

import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'models/entity/Base.entity';
import { HttpRequestMethod } from 'models/types/HttpRequestMethod';

type HttpContextConstructorParams = Omit<
  ExtractEntityProps<HttpContext>,
  'exception'
>;

@Entity({
  name: 'http_contexts',
})
export class HttpContext extends BaseEntity {
  @Column({
    type: 'text',
    nullable: true,
  })
  url?: string;

  @Column({
    type: 'enum',
    enum: HttpRequestMethod,
    nullable: true,
  })
  method?: HttpRequestMethod;

  @Column({
    name: 'status_code',
    type: 'int',
    nullable: true,
  })
  statusCode?: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  status?: string;

  @Column({
    name: 'client_ip',
    type: 'text',
    nullable: true,
  })
  clientIp?: string;

  @Column({
    name: 'response',
    type: 'jsonb',
    nullable: true,
  })
  response?: unknown;

  constructor(props: HttpContextConstructorParams) {
    super();

    Object.assign(this, props);
  }
}

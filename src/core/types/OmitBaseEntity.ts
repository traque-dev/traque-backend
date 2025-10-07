import { BaseEntity } from 'models/entity/Base.entity';

export type OmitBaseEntity<T> = Omit<T, keyof BaseEntity>;

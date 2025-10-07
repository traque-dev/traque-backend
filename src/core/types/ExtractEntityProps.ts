import { ExtractProps } from 'core/types/ExtractProps';
import { OmitBaseEntity } from 'core/types/OmitBaseEntity';

export type ExtractEntityProps<T> = OmitBaseEntity<ExtractProps<T>>;

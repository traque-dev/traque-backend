import { ExtractProps } from 'core/types/ExtractProps';

import { UIMessage } from 'ai';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

type ConversationDtoConstructorProps = Omit<
  ExtractProps<ConversationDTO>,
  'messages' | 'threadMetadata'
>;

class ThreadMetadata {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class ConversationDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ThreadMetadata)
  threadMetadata: ThreadMetadata;

  @IsArray()
  messages: UIMessage[];

  constructor(props: ConversationDtoConstructorProps) {
    Object.assign(this, props);
  }

  withMessages(messages: UIMessage[]) {
    this.messages = messages;

    return this;
  }
}

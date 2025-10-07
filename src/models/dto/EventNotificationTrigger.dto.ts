import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BaseDTO } from 'models/dto/Base.dto';
import { ProjectDTO } from 'models/dto/Project.dto';

export class EventNotificationTriggerDto extends BaseDTO {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ProjectDTO)
  @IsOptional()
  project?: ProjectDTO;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  onEvent: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  mobilePush?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  discord?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  constructor(props: ExtractProps<EventNotificationTriggerDto>) {
    super();

    Object.assign(this, props);
  }

  withProject(project: ProjectDTO) {
    this.project = project;

    return this;
  }
}

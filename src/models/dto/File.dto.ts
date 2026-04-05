import { ApiProperty } from '@nestjs/swagger';

import { FilePurpose } from 'models/types/FilePurpose';

interface FileDTOConstructorParams {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  purpose: FilePurpose;
  url: string;
  uploadedById?: string;
}

export class FileDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  key: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty({ enum: FilePurpose })
  purpose: FilePurpose;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  uploadedById?: string;

  constructor(params: FileDTOConstructorParams) {
    Object.assign(this, params);
  }
}

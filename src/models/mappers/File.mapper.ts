import { Injectable } from '@nestjs/common';

import { FileDTO } from 'models/dto/File.dto';
import { File } from 'models/entity/File.entity';

@Injectable()
export class FileMapper {
  toDTO(entity: File, url: string): FileDTO {
    return new FileDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      key: entity.key,
      originalName: entity.originalName,
      mimeType: entity.mimeType,
      size: entity.size,
      purpose: entity.purpose,
      url,
      uploadedById: entity.uploadedBy?.id,
    });
  }
}

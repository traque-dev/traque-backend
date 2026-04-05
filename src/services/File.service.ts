import { config } from 'core/config';
import { ForbiddenException } from 'core/exceptions/Forbidden.exception';

import { randomUUID } from 'crypto';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FileDTO } from 'models/dto/File.dto';
import { File } from 'models/entity/File.entity';
import { User } from 'models/entity/User.entity';
import { FileMapper } from 'models/mappers/File.mapper';
import { FilePurpose } from 'models/types/FilePurpose';

const PRESIGNED_URL_EXPIRES_IN_SECONDS = 3600;

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileMapper: FileMapper,
  ) {
    this.bucket = config.s3.bucket;

    this.s3 = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      ...(config.s3.endpoint ? { endpoint: config.s3.endpoint } : {}),
    });
  }

  async uploadFile(
    purpose: FilePurpose,
    multerFile: Express.Multer.File,
    uploadedBy?: User,
  ): Promise<FileDTO> {
    const ext = multerFile.originalname.split('.').pop();
    const key = `${purpose.toLowerCase()}/${randomUUID()}${ext ? `.${ext}` : ''}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: multerFile.buffer,
        ContentType: multerFile.mimetype,
        ContentLength: multerFile.size,
      }),
    );

    this.logger.log(`Uploaded file to S3: ${key}`);

    const file = new File({
      key,
      originalName: multerFile.originalname,
      mimeType: multerFile.mimetype,
      size: multerFile.size,
      purpose,
    });

    if (uploadedBy) {
      file.uploadedBy = uploadedBy;
    }

    const saved = await this.fileRepository.save(file);
    const url = await this.generatePresignedUrl(saved.key);

    return this.fileMapper.toDTO(saved, url);
  }

  async getFileById(id: string, requesterId: string): Promise<FileDTO> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: {
        uploadedBy: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    if (file.uploadedBy?.id !== requesterId) {
      throw new ForbiddenException({
        message: "You don't have an access to this file",
      });
    }

    const url = await this.generatePresignedUrl(file.key);

    return this.fileMapper.toDTO(file, url);
  }

  async deleteFile(id: string, requesterId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: {
        uploadedBy: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    if (file.uploadedBy?.id !== requesterId) {
      throw new ForbiddenException({
        message: "You don't have an access to this file",
      });
    }

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
      }),
    );

    this.logger.log(`Deleted file from S3: ${file.key}`);

    await this.fileRepository.delete(id);
  }

  generatePresignedUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS },
    );
  }
}

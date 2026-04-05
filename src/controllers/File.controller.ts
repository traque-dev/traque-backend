import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { PreAuthorizeOptional } from 'core/decorators/PreAuthorizeOptional.decorator';
import { Principal } from 'core/decorators/Principal.decorator';
import { RateLimit } from 'core/decorators/RateLimit.decorator';

import {
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import dayjs from 'dayjs';

import { FileDTO } from 'models/dto/File.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { User } from 'models/entity/User.entity';
import { FilePurpose } from 'models/types/FilePurpose';
import { FileService } from 'services/File.service';

@ApiTags('Files')
@Controller('/files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'purpose'],
      properties: {
        file: { type: 'string', format: 'binary' },
        purpose: { type: 'string', enum: Object.values(FilePurpose) },
      },
    },
  })
  @ApiResponse({ type: FileDTO })
  @Version('1')
  @PreAuthorizeOptional()
  @RateLimit({
    ttl: dayjs.duration({ minutes: 1 }).asMilliseconds(),
    limit: 10,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/')
  uploadFile(
    @Principal() user: User | undefined,
    @UploadedFile() file: Express.Multer.File,
    @Query('purpose', new ParseEnumPipe(FilePurpose)) purpose: FilePurpose,
  ): Promise<FileDTO> {
    this.logger.log(
      `Received upload file request by user: ${user?.id ?? 'anonymous'}, purpose: ${purpose}`,
    );

    return this.fileService.uploadFile(purpose, file, user);
  }

  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ type: FileDTO })
  @Version('1')
  @PreAuthorize()
  @Get('/:fileId')
  getFileById(
    @Principal() user: User,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ): Promise<FileDTO> {
    return this.fileService.getFileById(fileId, user.id);
  }

  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @Delete('/:fileId')
  async deleteFile(
    @Principal() user: User,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received delete file request by user: ${user.id}, fileId: ${fileId}`,
    );

    await this.fileService.deleteFile(fileId, user.id);

    return PositiveResponseDto.instance();
  }
}

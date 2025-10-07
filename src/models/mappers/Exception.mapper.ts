import { BaseMapper } from 'core/interfaces/BaseMapper.interface';

import { Injectable } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';

import { ExceptionDTO } from 'models/dto/Exception.dto';
import { ExceptionFrameDTO } from 'models/dto/ExceptionFrame.dto';
import { HttpContextDTO } from 'models/dto/HttpContext.dto';
import { PageDTO } from 'models/dto/Page.dto';
import { StacktraceDTO } from 'models/dto/Stacktrace.dto';
import { Exception } from 'models/entity/Exception.entity';
import { ExceptionFrame } from 'models/entity/ExceptionFrame.entity';
import { HttpContext } from 'models/entity/HttpContext.entity';

@Injectable()
export class ExceptionMapper implements BaseMapper<Exception, ExceptionDTO> {
  toDTO(entity: Exception): ExceptionDTO {
    const dto = new ExceptionDTO({
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      environment: entity.environment,
      message: entity.message,
      name: entity.name,
      platform: entity.platform,
    });

    if (entity.httpContext) {
      const httpContext = entity.httpContext;

      dto.withHttpContext(
        new HttpContextDTO({
          id: httpContext.id,
          createdAt: httpContext.createdAt,
          updatedAt: httpContext.updatedAt,
          clientIp: httpContext.clientIp,
          method: httpContext.method,
          status: httpContext.status,
          statusCode: httpContext.statusCode,
          url: httpContext.url,
          response: httpContext.response,
        }),
      );
    }

    if (entity.stack) {
      dto.withStacktrace(
        new StacktraceDTO({
          stack: entity.stack,
          frames: entity.frames?.map(
            (frameEntity) =>
              new ExceptionFrameDTO({
                frameIndex: frameEntity.frameIndex,
                filename: frameEntity.filename,
                functionName: frameEntity.functionName,
                lineNumber: frameEntity.lineNumber,
                columnNumber: frameEntity.columnNumber,
                absolutePath: frameEntity.absolutePath,
                module: frameEntity.module,
                inApp: frameEntity.inApp,
                platform: frameEntity.platform,
              }),
          ),
        }),
      );
    }

    return dto;
  }

  toEntity(dto: ExceptionDTO): Exception {
    const entity = new Exception({
      message: dto.message,
      suggestion: dto.suggestion,
      name: dto.name,
      details: dto.details,
      environment: dto.environment,
      platform: dto.platform,
    });

    if (dto.stacktrace) {
      entity.stack = dto.stacktrace?.stack;

      if (dto.stacktrace.frames) {
        entity.withFrames(
          dto.stacktrace.frames.map(
            (frameDto, index) =>
              new ExceptionFrame({
                frameIndex: index,
                filename: frameDto.filename,
                functionName: frameDto.functionName,
                lineNumber: frameDto.lineNumber,
                columnNumber: frameDto.columnNumber,
                absolutePath: frameDto.absolutePath,
                module: frameDto.module,
                inApp: frameDto.inApp,
                platform: frameDto.platform,
              }),
          ),
        );
      }
    }

    if (dto.httpContext) {
      const httpContext = dto.httpContext;

      entity.withHttpContext(
        new HttpContext({
          clientIp: httpContext.clientIp,
          method: httpContext.method,
          status: httpContext.status,
          statusCode: httpContext.statusCode,
          url: httpContext.url,
          response: httpContext.response,
        }),
      );
    }

    return entity;
  }

  mapToPage(paginationEntity: Pagination<Exception>): PageDTO<ExceptionDTO> {
    return new PageDTO<ExceptionDTO>(
      paginationEntity.items.map((item) => this.toDTO(item)),
      paginationEntity.meta,
    );
  }
}

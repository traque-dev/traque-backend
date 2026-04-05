import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileController } from 'controllers/File.controller';
import { File } from 'models/entity/File.entity';
import { FileMapper } from 'models/mappers/File.mapper';
import { FileService } from 'services/File.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService, FileMapper],
  exports: [FileService, FileMapper],
})
export class FileModule {}

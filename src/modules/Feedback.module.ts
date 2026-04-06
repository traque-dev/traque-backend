import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeedbackController } from 'controllers/Feedback.controller';
import { FeedbackActivityController } from 'controllers/FeedbackActivity.controller';
import { FeedbackCaptureController } from 'controllers/FeedbackCapture.controller';
import { FeedbackCommentController } from 'controllers/FeedbackComment.controller';
import { Feedback } from 'models/entity/Feedback.entity';
import { FeedbackActivity } from 'models/entity/FeedbackActivity.entity';
import { FeedbackComment } from 'models/entity/FeedbackComment.entity';
import { FeedbackFile } from 'models/entity/FeedbackFile.entity';
import { File } from 'models/entity/File.entity';
import { Project } from 'models/entity/Project.entity';
import { FeedbackMapper } from 'models/mappers/Feedback.mapper';
import { FeedbackActivityMapper } from 'models/mappers/FeedbackActivity.mapper';
import { FeedbackCommentMapper } from 'models/mappers/FeedbackComment.mapper';
import { FileModule } from 'modules/File.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { FeedbackService } from 'services/Feedback.service';
import { FeedbackActivityService } from 'services/FeedbackActivity.service';
import { FeedbackCommentService } from 'services/FeedbackComment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feedback,
      FeedbackFile,
      FeedbackComment,
      FeedbackActivity,
      File,
      Project,
    ]),
    OrganizationModule,
    ProjectModule,
    FileModule,
  ],
  controllers: [
    FeedbackController,
    FeedbackCaptureController,
    FeedbackCommentController,
    FeedbackActivityController,
  ],
  providers: [
    FeedbackService,
    FeedbackCommentService,
    FeedbackActivityService,
    FeedbackMapper,
    FeedbackCommentMapper,
    FeedbackActivityMapper,
  ],
  exports: [FeedbackService],
})
export class FeedbackModule {}

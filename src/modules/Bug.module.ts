import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BugController } from 'controllers/Bug.controller';
import { BugActivityController } from 'controllers/BugActivity.controller';
import { BugCaptureController } from 'controllers/BugCapture.controller';
import { BugCommentController } from 'controllers/BugComment.controller';
import { BugLabelController } from 'controllers/BugLabel.controller';
import { BugReproductionStepController } from 'controllers/BugReproductionStep.controller';
import { BugListener } from 'listeners/Bug.listener';
import { Bug } from 'models/entity/Bug.entity';
import { BugActivity } from 'models/entity/BugActivity.entity';
import { BugComment } from 'models/entity/BugComment.entity';
import { BugFile } from 'models/entity/BugFile.entity';
import { BugLabel } from 'models/entity/BugLabel.entity';
import { BugReproductionStep } from 'models/entity/BugReproductionStep.entity';
import { Exception } from 'models/entity/Exception.entity';
import { File } from 'models/entity/File.entity';
import { Member } from 'models/entity/Member.entity';
import { Project } from 'models/entity/Project.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { BugMapper } from 'models/mappers/Bug.mapper';
import { BugActivityMapper } from 'models/mappers/BugActivity.mapper';
import { BugCommentMapper } from 'models/mappers/BugComment.mapper';
import { BugLabelMapper } from 'models/mappers/BugLabel.mapper';
import { BugReproductionStepMapper } from 'models/mappers/BugReproductionStep.mapper';
import { FileModule } from 'modules/File.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { BugService } from 'services/Bug.service';
import { BugActivityService } from 'services/BugActivity.service';
import { BugCommentService } from 'services/BugComment.service';
import { BugLabelService } from 'services/BugLabel.service';
import { BugReproductionStepService } from 'services/BugReproductionStep.service';
import { PushNotificationService } from 'services/PushNotification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bug,
      BugReproductionStep,
      BugComment,
      BugLabel,
      BugActivity,
      Exception,
      Member,
      Project,
      PushNotificationToken,
      File,
      BugFile,
    ]),
    OrganizationModule,
    ProjectModule,
    FileModule,
  ],
  controllers: [
    BugController,
    BugCaptureController,
    BugCommentController,
    BugLabelController,
    BugReproductionStepController,
    BugActivityController,
  ],
  providers: [
    BugService,
    BugActivityService,
    BugCommentService,
    BugLabelService,
    BugReproductionStepService,
    BugMapper,
    BugActivityMapper,
    BugCommentMapper,
    BugLabelMapper,
    BugReproductionStepMapper,
    BugListener,
    PushNotificationService,
  ],
  exports: [BugService],
})
export class BugModule {}

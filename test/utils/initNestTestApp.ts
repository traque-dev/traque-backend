import { ValidationPipe } from '../../src/core/pipes/Validation.pipe';
import { AppModule } from '../../src/modules/App.module';

import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export async function initNestTestApp(): Promise<{
  app: INestApplication;
  moduleFixture: TestingModule;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication({
    bodyParser: false,
  });

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.init();

  return {
    app,
    moduleFixture,
  };
}

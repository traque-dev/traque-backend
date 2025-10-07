import { config } from 'core/config';
import { ValidationPipe } from 'core/pipes/Validation.pipe';

import {
  ConsoleLogger,
  INestApplication,
  Logger,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from 'modules/App.module';

class App {
  private app: INestApplication;
  private readonly logger = new Logger(App.name);

  setupApiDocs() {
    const apiReferencePath = '/api/reference';

    const documentBuilder = new DocumentBuilder()
      .setTitle('Traque API')
      .setDescription('The Traque API description')
      .setVersion('1.0')
      .build();
    const documentFactory = () =>
      SwaggerModule.createDocument(this.app, documentBuilder);
    // SwaggerModule.setup('/swagger', this.app, documentFactory);

    this.app.use(
      apiReferencePath,
      apiReference({
        content: documentFactory(),
      }),
    );
  }

  async bootstrap() {
    this.app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
        json: config.isProduction,
      }),
      bodyParser: false,
    });

    if (config.isProduction) {
      this.app.enableCors({
        origin: config.app.cors?.origins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      });
    } else {
      this.app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      });
    }

    this.app.setGlobalPrefix('/api');

    this.app.useGlobalPipes(new ValidationPipe({ transform: true }));
    this.app.enableVersioning({
      type: VersioningType.URI,
    });

    this.setupApiDocs();

    await this.app.listen(config.app.http.port);

    this.logger.verbose(
      `Application is running on: ${await this.app.getUrl()}`,
    );
  }
}

const app = new App();
app.bootstrap().catch((error) => {
  console.error(error);
});

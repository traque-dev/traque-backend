import { config } from 'core/config';
import { dataSourceConfig } from 'core/db/config';
import { getSSLConfig } from 'core/db/utils/getSSLConfig';
import { BodyParserMiddleware } from 'core/middlewares/BodyParser.middleware';
import { LoggerMiddleware } from 'core/middlewares/Logger.middleware';
import { dayjs } from 'core/utils/dayjs';

import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'modules/Ai.module';
import { ApiKeyModule } from 'modules/ApiKey.module';
import { AuthModule } from 'modules/Auth.module';
import { AwsIntegrationModule } from 'modules/AwsIntegration.module';
import { BillingModule } from 'modules/Billing.module';
import { EnvelopeModule } from 'modules/Envelope.module';
import { EventModule } from 'modules/Event.module';
import { ExceptionModule } from 'modules/Exception.module';
import { IpDetailsModule } from 'modules/IpDetails.module';
import { IssueModule } from 'modules/Issue.module';
import { OrganizationModule } from 'modules/Organization.module';
import { ProjectModule } from 'modules/Project.module';
import { UserModule } from 'modules/User.module';
import { WaitlistModule } from 'modules/Waitlist.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.app.datasource.host,
      port: config.app.datasource.port,
      database: config.app.datasource.database,
      username: config.app.datasource.username,
      password: config.app.datasource.password,
      ...getSSLConfig(),
      autoLoadEntities: true,
      synchronize: false,
      logging: ['error'],
      entities: dataSourceConfig.entities,
      migrationsTableName: 'migrations',
      migrationsRun: true,
      migrations: ['dist/core/db/migrations/*.js'],
    }),
    EventEmitterModule.forRoot({
      delimiter: '.',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: dayjs.duration({ minutes: 1 }).asMilliseconds(),
        limit: 20,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        username: config.redis.username,
        password: config.redis.password,
        db: config.redis.db,
      },
    }),
    AuthModule,
    ExceptionModule,
    UserModule,
    ProjectModule,
    OrganizationModule,
    IssueModule,
    AwsIntegrationModule,
    IpDetailsModule,
    ApiKeyModule,
    WaitlistModule,
    EventModule,
    AiModule,
    BillingModule,
    EnvelopeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/*path');
    consumer.apply(BodyParserMiddleware).forRoutes('/*path');
  }
}

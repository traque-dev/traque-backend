import { UserMiddleware } from 'core/middlewares/User.middleware';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from 'controllers/User.controller';
import { Account } from 'models/entity/Account.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { Session } from 'models/entity/Session.entity';
import { User } from 'models/entity/User.entity';
import { UserService } from 'services/User.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PushNotificationToken, Session, Account]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*path');
  }
}

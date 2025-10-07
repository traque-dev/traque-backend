import { Module } from '@nestjs/common';

import { AuthController } from 'controllers/Auth.controller';
import { AuthService } from 'services/Auth.service';

import { UserModule } from './User.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

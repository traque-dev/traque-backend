import { Module } from '@nestjs/common';

import { EncryptionService } from 'services/Encryption.service';

@Module({
  imports: [],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}

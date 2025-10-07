import { ValueTransformer } from 'typeorm';

import { EncryptionService } from 'services/Encryption.service';

export class EncryptionTransformer implements ValueTransformer {
  constructor(private readonly encryptionService: EncryptionService) {}

  to(value: string): string {
    return this.encryptionService.encrypt(value);
  }

  from(value: string) {
    return this.encryptionService.decrypt(value);
  }
}

export const encryptionTransformer = new EncryptionTransformer(
  new EncryptionService(),
);

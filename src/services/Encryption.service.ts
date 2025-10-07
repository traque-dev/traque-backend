import { config } from 'core/config';

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';

interface IEncryptionService {
  encrypt(text: string): string;
  decrypt(encryptedText: string): string;
}

@Injectable()
export class EncryptionService implements IEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;
  private readonly key: string;

  constructor() {
    this.key = config.app.encryption.key;

    if (this.key.length !== 64) {
      throw new Error(
        'Encryption key must be a 32-byte key in hex format (64 characters)',
      );
    }
  }

  public encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(
      this.algorithm,
      Buffer.from(this.key, 'hex'),
      iv,
    );
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  public decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encrypted = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv(
      this.algorithm,
      Buffer.from(this.key, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }
}

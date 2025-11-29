import crypto from 'crypto';

export function generateExternalProjectId(): string {
  const digits = '0123456789';
  const bytes = crypto.randomBytes(16);

  let result = '';
  for (let i = 0; i < 16; i++) {
    result += digits[bytes[i] % 10];
  }

  return result;
}

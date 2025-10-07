import { config } from 'core/config';

export function getSSLConfig() {
  if (config.isDevelopment) return {};

  return {
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

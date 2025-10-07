import { config } from 'core/config';

import { createGateway } from '@ai-sdk/gateway';

export const gateway = createGateway({
  apiKey: config.ai.vercel.apiKey,
});

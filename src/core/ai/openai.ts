import { config } from 'core/config';

import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: config.ai.openai.apiKey,
});

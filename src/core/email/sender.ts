import { config } from 'core/config';

import { Resend } from 'resend';

export const resend = new Resend(config.resend.apiKey);

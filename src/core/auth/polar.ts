import { config } from 'core/config';
import { getDataSource } from 'core/db/getDataSource';

import { Logger } from '@nestjs/common';
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import { Subscription as PolarSubscription } from '@polar-sh/sdk/models/components/subscription';

import { Subscription } from 'models/entity/Subscription.entity';

export const polarClient = new Polar({
  accessToken: config.polar.accessToken,
  server: config.isProduction ? 'production' : 'sandbox',
});

export const products = [
  {
    productId: config.polar.plusProductId ?? '',
    slug: 'plus',
  },
];

const logger = new Logger('Polar');

async function updateSubscription(
  polarSubscription: PolarSubscription,
): Promise<void> {
  logger.log(`Updating Polar subscription ${polarSubscription.id}`);

  const ds = await getDataSource();
  const subscriptionRepo = ds.getRepository(Subscription);

  await subscriptionRepo.upsert(Subscription.fromPolar(polarSubscription), [
    'polarSubscriptionId',
  ]);
}

export const polarPlugin: ReturnType<typeof polar> = polar({
  client: polarClient,
  createCustomerOnSignUp: false,
  enableCustomerPortal: true,
  use: [
    checkout({
      products,
      successUrl: `${config.app.webAppUrl}/plus/success?checkout_id={CHECKOUT_ID}`,
      authenticatedUsersOnly: true,
      allowDiscountCodes: true,
    }),
    portal(),
    usage(),
    webhooks({
      secret: config.polar.webhookSecret ?? '',
      onSubscriptionCreated: async ({ data }) => updateSubscription(data),
      onSubscriptionUpdated: async ({ data }) => updateSubscription(data),
      onSubscriptionActive: async ({ data }) => updateSubscription(data),
      onSubscriptionCanceled: async ({ data }) => updateSubscription(data),
      onSubscriptionRevoked: async ({ data }) => updateSubscription(data),
      onSubscriptionUncanceled: async ({ data }) => updateSubscription(data),
    }),
  ],
});

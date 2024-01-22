import {healthCheckCoCoPermissions,statusHandler } from '@commercetools/connect-payments-sdk'
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AdyenAPI } from '../clients/adyen/adyen.client';
import { config } from '../config/config';
import { paymentSDK } from '../payment-sdk';
const packageJSON = require('../../../package.json');

export const statusRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  fastify.get('/ping', async (request, reply) => {
    reply.code(200).send('pong');
  });

  const handler = statusHandler({
    timeout: 3000,
    checks: [
      healthCheckCoCoPermissions({
        requiredPermissions: ['manage_project'],
        oauth2Service: paymentSDK.oauth2Service,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        projectKey: config.projectKey,
      }),
      async () => {
        try {
          const paymentMethods = await AdyenAPI().PaymentsApi.paymentMethods({
            merchantAccount: config.adyenMerchantAccount,
          });
          return {
            name: 'Adyen API',
            status: 'UP',
            data: {
              paymentMethods,
            },
          };
        } catch (e) {
          return {
            name: 'Adyen API',
            status: 'DOWN',
            data: {
              // TODO do not expose the error
              error: e,
            },
          };
        }
      },
    ],
    metadataFn: async () => ({
      name: packageJSON.name,
      description: packageJSON.description,
      '@adyen/api-library': packageJSON.dependencies['@adyen/api-library'],
      '@commercetools/sdk-client-v2': packageJSON.dependencies['@commercetools/sdk-client-v2'],
    }),
  });
  fastify.get('/status', async (request, reply) => {
    const handle = await handler();
    reply.code(handle.status).send(handle.body);
  });
};

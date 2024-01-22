import { configHandler } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { config } from '../config/config';

export const configRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
  const handler = configHandler({
    configuration: () => ({
      clientKey: config.adyenClientKey,
      environment: config.adyenEnvironment,
      returnUrl: config.sellerReturnUrl,
    })
  })
  fastify.get('/config', async(request, reply) => {
    const result = await handler()
    reply.code(result.status).send(result.body);
  });
};

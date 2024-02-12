import { SessionAuthenticationHook, configHandler } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { config } from '../config/config';
import { Type } from '@sinclair/typebox';

type ConfigRoutesOptions = {
  sessionAuthHook: SessionAuthenticationHook;
};

export const configRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & ConfigRoutesOptions) => {
  const handler = configHandler({
    configuration: () => ({
      clientKey: config.mockClientKey,
      environment: config.mockEnvironment,
    }),
  });

  fastify.get(
    '/operations/config',
    {
      preHandler: [opts.sessionAuthHook.authenticate()],
      schema: {
        response: {
          200: Type.Any(),
        },
      },
    },
    async (request, reply) => {
      const result = await handler();
      reply.code(result.status).send(result.body);
    },
  );
};

import {
  JWTAuthenticationHook,
  healthCheckCommercetoolsPermissions,
  statusHandler,
} from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { config } from '../config/config';
import { StatusResponseSchema, StatusResponseSchemaDTO } from '../dtos/status.dto';
import { paymentSDK } from '../payment-sdk';
const packageJSON = require('../../package.json');

type StatusRoutesOptions = {
  jwtAuthHook: JWTAuthenticationHook;
};

export const statusRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & StatusRoutesOptions) => {
  fastify.get('/ping', async (request, reply) => {
    reply.code(200).send('pong');
  });

  const handler = statusHandler({
    timeout: config.healthCheckTimeout,
    checks: [
      healthCheckCommercetoolsPermissions({
        requiredPermissions: ['manage_project'],
        ctAuthorizationService: paymentSDK.ctAuthorizationService,
        projectKey: config.projectKey,
      }),
      async () => {
        try {
          const paymentMethods = 'card';
          return {
            name: 'Mock Payment API',
            status: 'UP',
            data: {
              paymentMethods,
            },
          };
        } catch (e) {
          return {
            name: 'Mock Payment API',
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
      '@commercetools/sdk-client-v2': packageJSON.dependencies['@commercetools/sdk-client-v2'],
    }),
  });

  fastify.get<{ Reply: StatusResponseSchemaDTO }>(
    '/status',
    {
      preHandler: [opts.jwtAuthHook.authenticate()],
      schema: {
        response: {
          200: StatusResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const handle = await handler();
      const body = await handle.body;
      reply.code(handle.status).send(body);
    },
  );
};

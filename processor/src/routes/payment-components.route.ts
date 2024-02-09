import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { PaymentService } from '../services/types/payment.type';
import { SupportedPaymentComponentsSchema } from '../dtos/payment-methods.dto';
import { JWTAuthenticationHook, AuthorityAuthorizationHook } from '@commercetools/connect-payments-sdk';

type PaymentComponentsRoutesOptions = {
  paymentService: PaymentService;
  jwtAuthHook: JWTAuthenticationHook;
  authorizationHook: AuthorityAuthorizationHook;
};

export const paymentComponentsRoute = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions & PaymentComponentsRoutesOptions,
) => {
  fastify.get(
    '/payment-components',
    {
      preHandler: [options.jwtAuthHook.authenticate(), options.authorizationHook.authorize('manage_project')],
      schema: {
        response: {
          200: SupportedPaymentComponentsSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await options.paymentService.getSupportedPaymentComponents();
      reply.code(200).send(result);
    },
  );
};

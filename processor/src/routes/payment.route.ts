import { FastifyInstance, FastifyPluginOptions, onRequestHookHandler } from 'fastify';
import { PaymentService } from '../services/types/payment.type';
import {
  PaymentRequestSchema,
  PaymentRequestSchemaDTO,
  PaymentResponseSchema,
  PaymentResponseSchemaDTO,
} from '../dtos/payment.dto';
import { SessionAuthenticationHook } from '@commercetools/connect-payments-sdk';

type PaymentRoutesOptions = {
  paymentService: PaymentService;
  sessionAuthHook: SessionAuthenticationHook;
};

export const paymentRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & PaymentRoutesOptions) => {
  fastify.post<{ Body: PaymentRequestSchemaDTO; Reply: PaymentResponseSchemaDTO }>(
    '/payments',
    {
      onRequest: [opts.sessionAuthHook.authenticate()],
      schema: {
        body: PaymentRequestSchema,
        response: {
          200: PaymentResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resp = await opts.paymentService.createPayment({
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );
};

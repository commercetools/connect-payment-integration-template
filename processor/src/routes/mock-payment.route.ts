import { SessionAuthenticationHook } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  PaymentRequestSchema,
  PaymentRequestSchemaDTO,
  PaymentResponseSchema,
  PaymentResponseSchemaDTO,
} from '../dtos/mock-payment.dto';
import { MockPaymentService } from '../services/mock-payment.service';

type PaymentRoutesOptions = {
  paymentService: MockPaymentService;
  sessionAuthHook: SessionAuthenticationHook;
};

export const paymentRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & PaymentRoutesOptions) => {
  fastify.post<{ Body: PaymentRequestSchemaDTO; Reply: PaymentResponseSchemaDTO }>(
    '/payments',
    {
      preHandler: [opts.sessionAuthHook.authenticate()],
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

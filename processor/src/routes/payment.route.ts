import { FastifyInstance, FastifyPluginOptions, onRequestHookHandler } from 'fastify';
import { PaymentService } from '../services/types/payment.type';
import {
  PaymentRequestSchema,
  PaymentRequestSchemaDTO,
  PaymentResponseSchema,
  PaymentResponseSchemaDTO,
} from '../dtos/payment.dto';

type PaymentRoutesOptions = {
  paymentService: PaymentService;
  sessionAuthHook: onRequestHookHandler;
};

export const paymentRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & PaymentRoutesOptions) => {
  fastify.post<{ Body: PaymentRequestSchemaDTO; Reply: PaymentResponseSchemaDTO }>(
    '/payments',
    {
      // TODO: implement session
      // onRequest: opts.sessionAuthHook,
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
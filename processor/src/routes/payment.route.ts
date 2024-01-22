import { FastifyInstance, FastifyPluginOptions, onRequestHookHandler } from 'fastify';
import {
  CreatePaymentData,
  CreateSessionData,
  GetPaymentMethodsData,
  PaymentData,
  PaymentMethodsData,
  SessionData,
} from '../dtos/payment.dto';
import { PaymentService } from '../services/types/payment.type';

type PaymentRoutesOptions = {
  paymentService: PaymentService;
  sessionAuthHook: onRequestHookHandler;
};

export const paymentRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & PaymentRoutesOptions) => {
  fastify.post<{ Body: GetPaymentMethodsData; Reply: PaymentMethodsData }>(
    '/payment-methods',
    {
      onRequest: opts.sessionAuthHook,
    },
    async (request, reply) => {
      const resp = await opts.paymentService.getPaymentMethods({
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: CreateSessionData; Reply: SessionData }>(
    '/payment-sessions',
    {
      onRequest: opts.sessionAuthHook,
    },
    async (request, reply) => {
      const resp = await opts.paymentService.createSession({
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: CreatePaymentData; Reply: PaymentData }>(
    '/payments',
    {
      onRequest: opts.sessionAuthHook,
    },
    async (request, reply) => {
      const resp = await opts.paymentService.createPayment({
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );
};

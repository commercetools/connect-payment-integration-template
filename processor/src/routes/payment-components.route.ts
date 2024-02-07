import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { PaymentService } from '../services/types/payment.type';

type PaymentComponentsRoutesOptions = {
  paymentService: PaymentService;
};

export const paymentComponentsRoute = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions & PaymentComponentsRoutesOptions,
) => {
  fastify.get('/payment-components', async (request, reply) => {
    const result = await options.paymentService.getSupportedPaymentComponents();
    reply.code(200).send(result);
  });
};

import { FastifyInstance } from 'fastify';
import { paymentSDK } from '../../payment-sdk';
import { paymentRoutes } from '../../routes/mock-payment.route';
import { MockPaymentService } from '../../services/mock-payment.service';

export default async function (server: FastifyInstance) {
  const mockPaymentService = new MockPaymentService({
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  });

  await server.register(paymentRoutes, {
    paymentService: mockPaymentService,
    sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
  });
}

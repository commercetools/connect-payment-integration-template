import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { config } from '../config/config';
import { ConfirmPaymentData, PaymentData } from '../dtos/payment.dto';
import { PaymentService } from '../services/types/payment.type';

type PaymentConfirmationRoutesOptions = {
  paymentService: PaymentService;
};

export const paymentConfirmationRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & PaymentConfirmationRoutesOptions,
) => {
  fastify.get<{ Body: any; Reply: PaymentData }>('/payments/confirmations', {}, async (request, reply) => {
    const queryParams = request.query as any;
    const confirmPaymentData: ConfirmPaymentData = {
      details: {
        redirectResult: queryParams.redirectResult as string,
      },
      paymentReference: queryParams.paymentReference as string,
    };

    const res = await opts.paymentService.confirmPayment({
      data: confirmPaymentData,
    });

    return reply.redirect(buildRedirectUrl(res.paymentReference));
  });

  fastify.post<{ Body: ConfirmPaymentData; Reply: any }>('/payments/confirmations', {}, async (request, reply) => {
    const res = await opts.paymentService.confirmPayment({
      data: request.body,
    });
    return reply.status(200).send(res);
  });

  fastify.get<{ Body: any; Reply: any }>('/seller-confirmation', {}, async (request, reply) => {
    return reply.redirect(config.sellerReturnUrl);
  });
};

const buildRedirectUrl = (paymentReference: string) => {
  const redirectUrl = new URL(config.sellerReturnUrl);
  redirectUrl.searchParams.append('paymentReference', paymentReference);
  return redirectUrl.toString();
};

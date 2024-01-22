import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PaymentService } from '../services/types/payment.type';
import { CapturePaymentRequestDTO, PaymentModificationResponseDTO, RefundPaymentRequestDTO } from '../dtos/payment.dto';

type PaymentRoutesOptions = {
  paymentService: PaymentService;
};

export const paymentModificationRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & PaymentRoutesOptions,
) => {
  fastify.post<{ Body: any; Reply: PaymentModificationResponseDTO }>(
    '/payments/:id/cancels',
    {},
    async (request, reply) => {
      const params = request.params as any;
      const resp = await opts.paymentService.cancelPayment({
        paymentId: params.id,
      });

      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: CapturePaymentRequestDTO; Reply: PaymentModificationResponseDTO }>(
    '/payments/:id/captures',
    {},
    async (request, reply) => {
      const params = request.params as any;
      const resp = await opts.paymentService.capturePayment({
        paymentId: params.id,
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );

  fastify.post<{ Body: RefundPaymentRequestDTO; Reply: PaymentModificationResponseDTO }>(
    '/payments/:id/refunds',
    {},
    async (request, reply) => {
      const params = request.params as any;
      const resp = await opts.paymentService.refundPayment({
        paymentId: params.id,
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );
};

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DeleteStoredPaymentMethodData } from '../dtos/payment.dto';
import { StoredPaymentMethodService } from '../services/types/stored-payment-method.type';

type StoredPaymentMethodRoutesOptions = {
  storedPaymentMethodService: StoredPaymentMethodService;
};

export const storedPaymentMethodRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & StoredPaymentMethodRoutesOptions,
) => {
  fastify.delete<{ Body: DeleteStoredPaymentMethodData; Reply: any }>(
    '/stored-payment-methods/:id',
    {},
    async (request, reply) => {
      const params = request.params as any;
      await opts.storedPaymentMethodService.deleteStoredPaymentMethod({
        paymentMethodId: params.id,
        customerId: request.body.customerId,
      });

      return reply.status(200).send();
    },
  );
};

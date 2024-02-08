import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PaymentService } from '../services/types/payment.type';
import {
    PaymentModificationRequestSchema,
    PaymentModificationRequestSchemaDTO,
    PaymentModificationResponseDTO,
    PaymentModificationResponseSchema,
} from '../dtos/payment.dto';

type PaymentRoutesOptions = {
  paymentService: PaymentService;
};

export const paymentModificationRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & PaymentRoutesOptions,
) => {
    fastify.post<{ Body: PaymentModificationRequestSchemaDTO; Reply: PaymentModificationResponseDTO }>(
        '/payment-intents/{id}',
        {
            // TODO: use the oauth hook
            onRequest: [opts.sessionAuthHook.authenticate()],
            schema: {
                body: PaymentModificationRequestSchema,
                response: {
                    200: PaymentModificationResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const params = request.params as any;
            const resp = await opts.paymentService.modifyPayment({
                paymentId: params.id,
                data: request.body,
            });

            return reply.status(200).send(resp);
        },
    );
};

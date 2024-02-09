import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PaymentService } from '../services/types/payment.type';
import {
    PaymentIntentUpdate,
    PaymentIntentUpdateDTO,
    PaymentIntentUpdateResponseDTO,
    PaymentIntentUpdateResponse,
} from '../dtos/payment.dto';

type PaymentRoutesOptions = {
  paymentService: PaymentService;
};

export const paymentModificationRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & PaymentRoutesOptions,
) => {
    fastify.post<{ Body: PaymentIntentUpdateDTO; Reply: PaymentIntentUpdateResponseDTO }>(
        '/payment-intents/:id',
        {
            preHandler: [
                opts.oauth2AuthenticationHook.authenticate(),
                opts.authorizationHook.authorize('manage_project', 'manage_checkout_payment_intents'),
            ],
            schema: {
                body: PaymentIntentUpdate,
                response: {
                    200: PaymentIntentUpdateResponse,
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

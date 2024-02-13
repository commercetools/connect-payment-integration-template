import {
  AuthorityAuthorizationHook,
  JWTAuthenticationHook,
  Oauth2AuthenticationHook,
  SessionAuthenticationHook,
} from '@commercetools/connect-payments-sdk';
import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ConfigResponseSchema, ConfigResponseSchemaDTO } from '../dtos/operations/config.dto';
import { SupportedPaymentComponentsSchema } from '../dtos/operations/payment-componets.dto';
import {
  PaymentIntentRequestSchema,
  PaymentIntentRequestSchemaDTO,
  PaymentIntentResponseSchema,
  PaymentIntentResponseSchemaDTO,
} from '../dtos/operations/payment-intents.dto';
import { StatusResponseSchema, StatusResponseSchemaDTO } from '../dtos/operations/status.dto';
import { OperationService } from '../services/types/operation.type';

type OperationRouteOptions = {
  sessionAuthHook: SessionAuthenticationHook;
  oauth2AuthHook: Oauth2AuthenticationHook;
  jwtAuthHook: JWTAuthenticationHook;
  authorizationHook: AuthorityAuthorizationHook;
  operationService: OperationService;
};

export const operationsRoute = async (fastify: FastifyInstance, opts: FastifyPluginOptions & OperationRouteOptions) => {
  fastify.get<{ Reply: ConfigResponseSchemaDTO }>(
    '/config',
    {
      preHandler: [opts.sessionAuthHook.authenticate()],
      schema: {
        response: {
          200: ConfigResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const config = await opts.operationService.getConfig();
      reply.code(200).send(config);
    },
  );

  fastify.get<{ Reply: StatusResponseSchemaDTO }>(
    '/status',
    {
      preHandler: [opts.jwtAuthHook.authenticate()],
      schema: {
        response: {
          200: StatusResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const status = await opts.operationService.getStatus();
      reply.code(200).send(status);
    },
  );

  fastify.get(
    '/payment-components',
    {
      preHandler: [opts.jwtAuthHook.authenticate()],
      schema: {
        response: {
          200: SupportedPaymentComponentsSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await opts.operationService.getSupportedPaymentComponents();
      reply.code(200).send(result);
    },
  );

  fastify.post<{ Body: PaymentIntentRequestSchemaDTO; Reply: PaymentIntentResponseSchemaDTO; Params: { id: string } }>(
    '/payment-intents/:id',
    {
      preHandler: [
        opts.oauth2AuthHook.authenticate(),
        opts.authorizationHook.authorize('manage_project', 'manage_checkout_payment_intents'),
      ],
      schema: {
        params: {
          id: Type.String(),
        },
        body: PaymentIntentRequestSchema,
        response: {
          200: PaymentIntentResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const resp = await opts.operationService.modifyPayment({
        paymentId: id,
        data: request.body,
      });

      return reply.status(200).send(resp);
    },
  );
};

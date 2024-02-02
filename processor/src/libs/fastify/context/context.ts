import { Authentication, SessionAuthentication } from '@commercetools/connect-payments-sdk';
import { fastifyRequestContext, requestContext } from '@fastify/request-context';
import { randomUUID } from 'crypto';
import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export type ContextData = {
  anonymousId?: string;
  customerId?: string;
  path?: string;
  pathTemplate?: string;
  pathParams?: any;
  query?: any;
  correlationId: string;
  requestId: string;
  authentication?: Authentication;
};

export const getRequestContext = (): Partial<ContextData> => {
  return requestContext.get('request') ?? {};
};

export const setRequestContext = (ctx: ContextData) => {
  requestContext.set('request', ctx);
};

export const updateRequestContext = (ctx: Partial<ContextData>) => {
  const currentContext = getRequestContext();
  setRequestContext({
    ...(currentContext as ContextData),
    ...ctx,
  });
};

export const getCartIdFromContext = (): string => {
  const authentication = getRequestContext().authentication as SessionAuthentication;
  return authentication?.getPrincipal().cartId;
};

export const getAllowedPaymentMethodsFromContext = (): string[] => {
  const authentication = getRequestContext().authentication as SessionAuthentication;
  return authentication?.getPrincipal().allowedPaymentMethods;
};

export const requestContextPlugin = fp(async (fastify: FastifyInstance) => {
  // Enance the request object with a correlationId property
  fastify.decorateRequest('correlationId', '');

  // Propagate the correlationId from the request header to the request object
  fastify.addHook('onRequest', (req, reply, done) => {
    req.correlationId = req.headers['x-correlation-id'] ? (req.headers['x-correlation-id'] as string) : undefined;
    done();
  });

  // Register the request context
  await fastify.register(fastifyRequestContext, {
    defaultStoreValues: (req: FastifyRequest) => ({
      request: {
        path: req.url,
        pathTemplate: req.routeOptions.url,
        pathParams: req.params,
        query: req.query,
        correlationId: req.correlationId || randomUUID().toString(),
        requestId: req.id,
      },
    }),
    hook: 'onRequest',
  });
});

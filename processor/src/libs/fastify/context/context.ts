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
};

export type SessionContextData = {
  cartId: string;
  allowedPaymentMethods: string[];
};

export const getRequestContext = (): ContextData => {
  return requestContext.get('request') || ({} as ContextData);
};

export const setRequestContext = (ctx: ContextData) => {
  requestContext.set('request', ctx);
};

export const updateRequestContext = (ctx: Partial<ContextData>) => {
  const currentContext = getRequestContext();
  setRequestContext({
    ...currentContext,
    ...ctx,
  });
};

export const getSessionContext = (): SessionContextData => {
  return requestContext.get('session') || ({} as SessionContextData);
};

export const setSessionContext = (ctx: SessionContextData) => {
  requestContext.set('session', ctx);
};

export const updateSessionContext = (ctx: Partial<SessionContextData>) => {
  const currentContext = getSessionContext();
  setSessionContext({
    ...currentContext,
    ...ctx,
  });
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

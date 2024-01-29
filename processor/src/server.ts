import cors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import Fastify, { FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { config } from './config/config';
import { requestContextPlugin } from './libs/fastify/context/context';
import { errorHandler } from './libs/fastify/error-handler';
import { paymentSDK } from './payment-sdk';
import { configRoutes } from './routes/config.route';
import { paymentRoutes } from './routes/payment.route';
import { statusRoutes } from './routes/status.route';
import { DefaultPaymentService } from './services/payment.service';

/**
 * Setup Fastify server instance
 * @returns
 */
export const setupFastify = async () => {
  // Create fastify server instance
  const server = Fastify({
    logger: {
      level: config.loggerLevel,
    },
    genReqId: () => randomUUID().toString(),
    requestIdLogLabel: 'requestId',
    requestIdHeader: 'x-request-id',
  });

  // Setup error handler
  server.setErrorHandler(errorHandler);

  // Enable CORS
  await server.register(cors, {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID', 'X-Session-ID'],
    origin: '*',
  });

  // Add content type parser for the content type application/x-www-form-urlencoded
  await server.register(fastifyFormBody);

  // Register context plugin
  await server.register(requestContextPlugin);

  // Configure session auth hook for Authorizing requests based on the `X-Session-ID` header
  const sessionAuthHookOnRequest = async (req: FastifyRequest) => {
    return paymentSDK.sessionAuthHookFn({
      headers: req.headers,
    });
  };

  // Register default routes
  await server.register(statusRoutes);
  await server.register(configRoutes);

  const paymentService = new DefaultPaymentService({
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  });

  await server.register(paymentRoutes, {
    paymentService,
    sessionAuthHook: sessionAuthHookOnRequest,
  });

  return server;
};

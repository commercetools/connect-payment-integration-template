import cors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import Fastify, { FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from './config/config';
import { requestContextPlugin } from './libs/fastify/context/context';
import { errorHandler } from './libs/fastify/error-handler';
import { paymentSDK } from './payment-sdk';
import { configRoutes } from './routes/config.route';
import { notificationRoutes } from './routes/notification.route';
import { paymentConfirmationRoutes } from './routes/payment-confirmation.route';
import { paymentModificationRoutes } from './routes/payment-modification.route';
import { paymentRoutes } from './routes/payment.route';
import { statusRoutes } from './routes/status.route';
import { storedPaymentMethodRoutes } from './routes/stored-payment-method.route';
import { DefaultNotificationAuthenticator } from './security/auth/adyen-hmac.auth';
import { DefaultNotificationService } from './services/notification.service';
import { DefaultPaymentService } from './services/payment.service';
import { DefaultStoredPaymentMethodService } from './services/stored-payment-method.service';

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

  // Serve static files from the compiled folder
  await server.register(fastifyStatic, {
    root: path.join(__dirname, '../../dist/client'),
    prefix: '/',
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

  // Initialize the specific Adyen servicee
  const paymentService = new DefaultPaymentService({
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  });
  const authenticator = new DefaultNotificationAuthenticator();
  const notificationService = new DefaultNotificationService({
    ctPaymentService: paymentSDK.ctPaymentService,
  });
  const storedPaymentMethodService = new DefaultStoredPaymentMethodService();

  await server.register(paymentRoutes, {
    paymentService,
    sessionAuthHook: sessionAuthHookOnRequest,
  });
  await server.register(paymentModificationRoutes, {
    paymentService,
  });
  await server.register(paymentConfirmationRoutes, {
    paymentService,
  });
  await server.register(storedPaymentMethodRoutes, {
    storedPaymentMethodService,
  });
  await server.register(notificationRoutes, {
    authenticator,
    notificationService,
  });

  return server;
};

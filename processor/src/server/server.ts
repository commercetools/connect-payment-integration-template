import autoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { join } from 'path';
import { config } from '../config/config';
import { requestContextPlugin } from '../libs/fastify/context/context';
import { errorHandler } from '../libs/fastify/error-handler';

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

  await server.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
  });

  return server;
};

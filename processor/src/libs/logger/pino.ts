import logger from 'pino';
import serializer from 'pino-std-serializers';

import { config } from '../../config/config';
import { getRequestContext } from '../fastify/context/context';


export const log = logger({
  level: config.loggerLevel,
  serializers: {
    err: serializer.errWithCause,
  },
  mixin: () => {
    const context = getRequestContext();
    return !context || Object.keys(context).length === 0
      ? {}
      : {
          correlationId: context.correlationId,
          request: {
            ...context,
          },
        };
  },
});

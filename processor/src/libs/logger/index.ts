import { createApplicationLogger, rewriteFieldsFormatter } from '@commercetools-backend/loggers';
import { getRequestContext } from '../fastify/context/context';
import { config } from '../../config/config';

/**
 * Custom fields formatter to replace the removed defaultFieldsFormatter from the SDK
 * Uses rewriteFieldsFormatter to add standard fields to all log messages
 */
export const log = createApplicationLogger({
  formatters: [
    rewriteFieldsFormatter({
      fields: [
        {
          from: 'projectKey',
          to: 'projectKey',
          replaceValue: () => config.projectKey,
        },
        {
          from: 'version',
          to: 'version',
          replaceValue: () => process.env.npm_package_version || 'unknown',
        },
        {
          from: 'name',
          to: 'name',
          replaceValue: () => process.env.npm_package_name || 'unknown',
        },
        {
          from: 'correlationId',
          to: 'correlationId',
          replaceValue: () => getRequestContext().correlationId,
        },
        {
          from: 'pathTemplate',
          to: 'pathTemplate',
          replaceValue: () => getRequestContext().pathTemplate,
        },
        {
          from: 'path',
          to: 'path',
          replaceValue: () => getRequestContext().path,
        },
      ],
    }),
  ],
});

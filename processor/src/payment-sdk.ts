import { setupPaymentSDK, Logger, RequestContextData } from '@commercetools/connect-payments-sdk';
import { config } from './config/config';
import { getRequestContext, updateRequestContext } from './libs/fastify/context/context';
import { log } from './libs/logger/index';

export class AppLogger implements Logger {
  public debug = (obj: object, message: string) => {
    log.debug(obj ? obj : message);
  };
  public info = (obj: object, message: string) => {
    log.info(obj ? obj : message);
  };
  public warn = (obj: object, message: string) => {
    log.warn(obj ? obj : message);
  };
  public error = (obj: object, message: string) => {
    log.error(obj ? obj : message);
  };
}

const appLogger = new AppLogger();

export const paymentSDK = setupPaymentSDK({
  apiUrl: config.apiUrl,
  authUrl: config.authUrl,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  projectKey: config.projectKey,
  sessionUrl: config.sessionUrl,
  jwksUrl: config.jwksUrl,
  jwtIssuer: config.jwtIssuer,
  getContextFn: (): RequestContextData => {
    const { correlationId, requestId, authentication } = getRequestContext();
    return {
      correlationId: correlationId || '',
      requestId: requestId || '',
      authentication,
    };
  },
  updateContextFn: (context: Partial<RequestContextData>) => {
    const requestContext = Object.assign(
      {},
      context.correlationId ? { correlationId: context.correlationId } : {},
      context.requestId ? { requestId: context.requestId } : {},
      context.authentication ? { authentication: context.authentication } : {},
    );
    updateRequestContext(requestContext);
  },
  logger: appLogger,
});

import { setupPaymentSDK, Logger, RequestContextData } from '@commercetools/connect-payments-sdk';
import { config } from './config/config';
import {
  getRequestContext,
  getSessionContext,
  updateRequestContext,
  updateSessionContext,
} from './libs/fastify/context/context';

export class AppLogger implements Logger {
  public debug = (obj: object, message: string) => {
    // log.debug(obj, message);
  };
  public info = (obj: object, message: string) => {
    // log.info(obj, message);
  };
  public warn = (obj: object, message: string) => {
    // log.warn(obj, message);
  };
  public error = (obj: object, message: string) => {
    // log.error(obj, message);
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
  getContextFn: (): RequestContextData => {
    const { correlationId, requestId } = getRequestContext();
    const { cartId, allowedPaymentMethods } = getSessionContext();
    return {
      correlationId,
      requestId,
      sessionData: {
        allowedPaymentMethods,
        cartId,
      },
    };
  },
  updateContextFn: (context: Partial<RequestContextData>) => {
    const requestContext = Object.assign(
      {},
      context.correlationId ? { correlationId: context.correlationId } : {},
      context.requestId ? { requestId: context.requestId } : {},
    );
    updateRequestContext(requestContext);

    const sessionContext = Object.assign(
      {},
      context.sessionData?.cartId ? { cartId: context.sessionData.cartId } : {},
      context.sessionData?.allowedPaymentMethods
        ? { allowedPaymentMethods: context.sessionData.allowedPaymentMethods }
        : {},
    );
    updateSessionContext(sessionContext);
  },
  logger: appLogger,
});
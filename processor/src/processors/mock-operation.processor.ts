import { healthCheckCommercetoolsPermissions, statusHandler } from '@commercetools/connect-payments-sdk';
import { config } from '../config/config';
import { PaymentModificationStatus } from '../dtos/operations/payment-intents.dto';
import { paymentSDK } from '../payment-sdk';
import {
    CancelPaymentRequest,
    CapturePaymentRequest,
    ConfigResponse,
    PaymentProviderModificationResponse,
    RefundPaymentRequest,
    StatusResponse
} from '../services/types/operation.type';
import { OperationProcessor } from './operation.processor';
const packageJSON = require('../../package.json');

export class MockOperationProcessor implements OperationProcessor {

  async config (): Promise<ConfigResponse> {
    return {
      clientKey: config.mockClientKey,
      environment: config.mockEnvironment,
    };
  }

  async status (): Promise<StatusResponse> {
    const handler = await statusHandler({
      timeout: config.healthCheckTimeout,
      checks: [
        healthCheckCommercetoolsPermissions({
          requiredPermissions: ['manage_project'],
          ctAuthorizationService: paymentSDK.ctAuthorizationService,
          projectKey: config.projectKey,
        }),
        async () => {
          try {
            const paymentMethods = 'card';
            return {
              name: 'Mock Payment API',
              status: 'UP',
              data: {
                paymentMethods,
              },
            };
          } catch (e) {
            return {
              name: 'Mock Payment API',
              status: 'DOWN',
              data: {
                // TODO do not expose the error
                error: e,
              },
            };
          }
        },
      ],
      metadataFn: async () => ({
        name: packageJSON.name,
        description: packageJSON.description,
        '@commercetools/sdk-client-v2': packageJSON.dependencies['@commercetools/sdk-client-v2'],
      }),
    })();

    return handler.body

  }

  async capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.pspReference };
  }

  async cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.pspReference };
  }

  async refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse> {
    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.pspReference };
  }

}

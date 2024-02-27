import { describe, test, expect, afterEach } from '@jest/globals';
import {
  ConfigResponse,
  OperationService,
  OperationServiceOptions,
  ModifyPayment,
} from '../src/services/types/operation.type';
import { DefaultOperationService } from '../src/services/operation.service';
import { MockOperationProcessor } from '../src/services/processors/mock-operation.processor';
import { paymentSDK } from '../src/payment-sdk';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { mockGetPaymentResult, mockUpdatePaymentResult } from './utils/mock-payment-data';
import * as Config from '../src/config/config';

describe('operation.service', () => {
  const opts: OperationServiceOptions = {
    operationProcessor: new MockOperationProcessor(),
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('getConfig', async () => {
    const mockConfig = Config.config;
    mockConfig.mockClientKey = '';
    mockConfig.mockEnvironment = 'test';

    jest.spyOn(Config, 'getConfig').mockReturnValue(mockConfig);
    const opService: OperationService = new DefaultOperationService(opts);
    const result: ConfigResponse = await opService.getConfig();
    expect(result?.clientKey).toStrictEqual('');
    expect(result?.environment).toStrictEqual('test');
  });

  test('getSupportedPaymentComponents', async () => {
    const opService: OperationService = new DefaultOperationService(opts);
    const result: ConfigResponse = await opService.getSupportedPaymentComponents();
    expect(result?.components).toHaveLength(1);
    expect(result?.components[0]?.type).toStrictEqual('card');
  });

  test('modifyPayment', async () => {
    const opService: OperationService = new DefaultOperationService(opts);
    const modifyPaymentOpts: ModifyPayment = {
      paymentId: 'dummy-paymentId',
      data: {
        actions: [
          {
            action: 'cancelPayment',
          },
        ],
      },
    };

    jest.spyOn(DefaultPaymentService.prototype, 'getPayment').mockResolvedValue(mockGetPaymentResult);
    jest.spyOn(DefaultPaymentService.prototype, 'updatePayment').mockResolvedValue(mockUpdatePaymentResult);

    const result = await opService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });
});

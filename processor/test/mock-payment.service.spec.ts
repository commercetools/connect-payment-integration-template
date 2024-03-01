import { describe, test, expect, afterEach } from '@jest/globals';
import { ConfigResponse, ModifyPayment } from '../src/services/types/operation.type';

import { paymentSDK } from '../src/payment-sdk';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { mockGetPaymentResult, mockUpdatePaymentResult } from './utils/mock-payment-data';
import * as Config from '../src/config/config';
import { MockPaymentServiceOptions } from '../src/services/types/mock-payment.type';
import { AbstractPaymentService } from '../src/services/abstract-payment.service';
import { MockPaymentService } from '../src/services/mock-payment.service';

describe('mock-payment.service', () => {
  const opts: MockPaymentServiceOptions = {
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
    const paymentService: AbstractPaymentService = new MockPaymentService(opts);
    const result: ConfigResponse = await paymentService.config();
    expect(result?.clientKey).toStrictEqual('');
    expect(result?.environment).toStrictEqual('test');
  });

  test('getSupportedPaymentComponents', async () => {
    const paymentService: AbstractPaymentService = new MockPaymentService(opts);
    const result: ConfigResponse = await paymentService.getSupportedPaymentComponents();
    expect(result?.components).toHaveLength(1);
    expect(result?.components[0]?.type).toStrictEqual('card');
  });

  test('modifyPayment', async () => {
    const paymentService: AbstractPaymentService = new MockPaymentService(opts);
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

    const result = await paymentService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });
});

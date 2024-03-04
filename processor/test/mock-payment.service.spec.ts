import { describe, test, expect, afterEach } from '@jest/globals';
import { ConfigResponse, ModifyPayment, StatusResponse } from '../src/services/types/operation.type';

import { paymentSDK } from '../src/payment-sdk';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { mockGetPaymentResult, mockUpdatePaymentResult } from './utils/mock-payment-data';
import * as Config from '../src/config/config';
import { MockPaymentServiceOptions } from '../src/services/types/mock-payment.type';
import { AbstractPaymentService } from '../src/services/abstract-payment.service';
import { MockPaymentService } from '../src/services/mock-payment.service';
import * as StatusHandler from '@commercetools/connect-payments-sdk/dist/api/handlers/status.handler';

import { HealthCheckResult } from '@commercetools/connect-payments-sdk';

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

  test('getStatus', async () => {
    const mockData: () => Promise<HealthCheckResult> = async () => {
      const result: HealthCheckResult = {
        name: 'CoCo Permissions',
        status: 'DOWN',
        details: {},
      };
      return result;
    };
    jest.spyOn(StatusHandler, 'healthCheckCommercetoolsPermissions').mockReturnValue(mockData);
    const paymentService: AbstractPaymentService = new MockPaymentService(opts);
    const result: StatusResponse = await paymentService.status();

    expect(result?.status).toBeDefined();
    expect(result?.checks).toHaveLength(2);
    expect(result?.status).toStrictEqual('Partially Available');
    expect(result?.checks[0]?.name).toStrictEqual('CoCo Permissions');
    expect(result?.checks[0]?.status).toStrictEqual('DOWN');
    expect(result?.checks[0]?.details).toStrictEqual({});
    expect(result?.checks[1]?.name).toStrictEqual('Mock Payment API');
    expect(result?.checks[1]?.status).toStrictEqual('UP');
    expect(result?.checks[1]?.details).toBeDefined();
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

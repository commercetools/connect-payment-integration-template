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
import sinon from 'sinon';
import * as Config from '../src/config/config';

describe('operation.service', () => {
  const opts: OperationServiceOptions = {
    operationProcessor: new MockOperationProcessor(),
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  };

  afterEach(() => {
    sinon.restore();
  });
  test('getConfig', async () => {
    sinon.stub(Config, 'getConfig').callsFake(() => {
      const config = Config.config;
      config.mockClientKey = '';
      config.mockEnvironment = 'test';
      return config;
    });
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

    sinon.stub(DefaultPaymentService.prototype, 'getPayment').callsFake(async () => {
      return mockGetPaymentResult;
    });

    sinon.stub(DefaultPaymentService.prototype, 'updatePayment').callsFake(async () => {
      return mockUpdatePaymentResult;
    });
    const result = await opService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });
});

import { describe, test, expect } from '@jest/globals';
import { ConfigResponse, OperationService, OperationServiceOptions } from '../src/services/types/operation.type';
import { DefaultOperationService } from '../src/services/operation.service';
import { StatusResponseSchemaDTO } from '../src/dtos/operations/status.dto';

import { MockOperationProcessor } from '../src/services/processors/mock-operation.processor';
import { paymentSDK } from '../src/payment-sdk';
import sinon from 'sinon';
import * as connectpaymentsSDK from '@commercetools/connect-payments-sdk';
import { CommercetoolsAuthorizationService } from '@commercetools/connect-payments-sdk/dist/commercetools';

import { HealthCheckResult } from '@commercetools/connect-payments-sdk/dist/api/handlers/status.handler';
import * as Config from '../src/config/config';

describe('operation.service', () => {
  test('getConfig', async () => {
    const opts: OperationServiceOptions = {
      operationProcessor: new MockOperationProcessor(),
      ctCartService: paymentSDK.ctCartService,
      ctPaymentService: paymentSDK.ctPaymentService,
    };
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

  test.skip('getStatus', async () => {
    const opts: OperationServiceOptions = {
      operationProcessor: new MockOperationProcessor(),
      ctCartService: paymentSDK.ctCartService,
      ctPaymentService: paymentSDK.ctPaymentService,
    };

    const getMockFunction: () => Promise<HealthCheckResult> = async () => {
      return {
        name: 'CoCo Permissions',
        status: 'UP',
      };
    };

    const fakeCall: (opts: {
      ctAuthorizationService: CommercetoolsAuthorizationService;
      projectKey: string;
      requiredPermissions: string[];
    }) => () => Promise<HealthCheckResult> = () => {
      return getMockFunction;
    };

    sinon.stub(connectpaymentsSDK, 'healthCheckCommercetoolsPermissions').callsFake(fakeCall);
    const opService: OperationService = new DefaultOperationService(opts);
    const result: StatusResponseSchemaDTO = await opService.getStatus();
    expect(result?.status).toStrictEqual('OK');
    expect(result?.checks).toHaveLength(2);
    expect(result?.checks[0]?.name).toStrictEqual('CoCo Permissions');
    expect(result?.checks[0]?.status).toStrictEqual('UP');
    expect(result?.checks[1]?.name).toStrictEqual('Mock Payment API');
    expect(result?.checks[1]?.status).toStrictEqual('UP');
  });
});

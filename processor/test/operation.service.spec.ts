import { describe, test, expect } from '@jest/globals';
import {OperationService, OperationServiceOptions} from "../src/services/types/operation.type";
import {DefaultOperationService} from "../src/services/operation.service";
import {StatusResponseSchemaDTO} from "../src/dtos/operations/status.dto";

import {MockOperationProcessor} from "../src/services/processors/mock-operation.processor";
import { paymentSDK } from "../src/payment-sdk";

describe('operation.service', () => {

    // Please customize test cases below
    test('getStatus', async () => {
        const opts: OperationServiceOptions = {
            operationProcessor : new MockOperationProcessor(),
            ctCartService: paymentSDK.ctCartService,
            ctPaymentService: paymentSDK.ctPaymentService,
        }
        const opService : OperationService = new DefaultOperationService(opts);
        const result: StatusResponseSchemaDTO = await opService.getStatus();
        expect(result?.status).toStrictEqual('OK');
        expect(result?.checks).toHaveLength(2);
        expect(result?.checks[0]?.name).toStrictEqual('CoCo Permissions')
        expect(result?.checks[0]?.status).toStrictEqual('UP')
        expect(result?.checks[1]?.name).toStrictEqual('Mock Payment API')
        expect(result?.checks[1]?.status).toStrictEqual('UP')
    });
});

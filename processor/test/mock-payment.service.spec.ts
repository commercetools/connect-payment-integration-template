import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { ConfigResponse, ModifyPayment, StatusResponse } from '../src/services/types/operation.type';
import { paymentSDK } from '../src/payment-sdk';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { DefaultCartService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-cart.service';
import {
  mockGetPaymentResult,
  mockGetPaymentResultWithoutTransactions,
  mockUpdatePaymentResult,
  mockUpdatePaymentResultWithRefundTransaction,
} from './utils/mock-payment-results';
import { mockGetCartResult } from './utils/mock-cart-data';
import * as Config from '../src/config/config';
import { CreatePaymentRequest, MockPaymentServiceOptions } from '../src/services/types/mock-payment.type';
import { AbstractPaymentService } from '../src/services/abstract-payment.service';
import { MockPaymentService } from '../src/services/mock-payment.service';
import * as FastifyContext from '../src/libs/fastify/context/context';
import * as StatusHandler from '@commercetools/connect-payments-sdk/dist/api/handlers/status.handler';

import {
  ErrorInvalidField,
  ErrorInvalidOperation,
  ErrorRequiredField,
  HealthCheckResult,
  PaymentMethod,
} from '@commercetools/connect-payments-sdk';
import { DefaultPaymentMethodService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment-method.service';
import { PaymentMethodType, PaymentOutcome } from '../src/dtos/mock-payment.dto';
import { TransactionDraftDTO } from '../src/dtos/operations/transaction.dto';
import * as StoredPaymentMethodsConfig from '../src/config/stored-payment-methods.config';

interface FlexibleConfig {
  [key: string]: string; // Adjust the type according to your config values
}

function setupMockConfig(keysAndValues: Record<string, string>) {
  const mockConfig: FlexibleConfig = {};
  Object.keys(keysAndValues).forEach((key) => {
    mockConfig[key] = keysAndValues[key];
  });

  jest.spyOn(Config, 'getConfig').mockReturnValue(mockConfig as any);
}

describe('mock-payment.service', () => {
  const opts: MockPaymentServiceOptions = {
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
    ctPaymentMethodService: paymentSDK.ctPaymentMethodService,
  };
  const paymentService: AbstractPaymentService = new MockPaymentService(opts);
  const mockPaymentService: MockPaymentService = new MockPaymentService(opts);
  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getConfig', async () => {
    // Setup mock config for a system using `clientKey`
    setupMockConfig({ mockClientKey: '', mockEnvironment: 'test' });

    const result: ConfigResponse = await paymentService.config();

    // Assertions can remain the same or be adapted based on the abstracted access
    expect(result?.clientKey).toStrictEqual('');
    expect(result?.environment).toStrictEqual('test');
  });

  test('getSupportedPaymentComponents', async () => {
    const result: ConfigResponse = await paymentService.getSupportedPaymentComponents();
    expect(result?.components).toHaveLength(4);
    expect(result?.components[0]?.type).toStrictEqual('card');
    expect(result?.components[1]?.type).toStrictEqual('customtestmethod');
    expect(result?.components[2]?.type).toStrictEqual('invoice');
    expect(result?.components[3]?.type).toStrictEqual('purchaseorder');
    expect(result?.dropins).toHaveLength(0);
  });

  test('getStatus', async () => {
    const mockHealthCheckFunction: () => Promise<HealthCheckResult> = async () => {
      const result: HealthCheckResult = {
        name: 'CoCo Permissions',
        status: 'DOWN',
        details: {
          message: 'CoCo Permissions are not available',
        },
      };
      return result;
    };

    jest.spyOn(StatusHandler, 'healthCheckCommercetoolsPermissions').mockReturnValue(mockHealthCheckFunction);
    const paymentService: AbstractPaymentService = new MockPaymentService(opts);
    const result: StatusResponse = await paymentService.status();

    expect(result?.status).toBeDefined();
    expect(result?.checks).toHaveLength(2);
    expect(result?.status).toStrictEqual('Partially Available');
    expect(result?.checks[0]?.name).toStrictEqual('CoCo Permissions');
    expect(result?.checks[0]?.status).toStrictEqual('DOWN');
    expect(result?.checks[0]?.details).toStrictEqual({ message: 'CoCo Permissions are not available' });
    expect(result?.checks[1]?.name).toStrictEqual('Mock Payment API');
    expect(result?.checks[1]?.status).toStrictEqual('UP');
    expect(result?.checks[1]?.details).toBeDefined();
    expect(result?.checks[1]?.message).toBeDefined();
  });

  test('cancelPayment', async () => {
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
    jest.spyOn(DefaultPaymentService.prototype, 'getPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

    const result = await paymentService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });

  test('capturePayment', async () => {
    const modifyPaymentOpts: ModifyPayment = {
      paymentId: 'dummy-paymentId',
      data: {
        actions: [
          {
            action: 'capturePayment',
            amount: {
              centAmount: 150000,
              currencyCode: 'USD',
            },
          },
        ],
      },
    };
    jest.spyOn(DefaultPaymentService.prototype, 'getPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

    const result = await paymentService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });

  test('refundPayment', async () => {
    const modifyPaymentOpts: ModifyPayment = {
      paymentId: 'dummy-paymentId',
      data: {
        actions: [
          {
            action: 'refundPayment',
            amount: {
              centAmount: 150000,
              currencyCode: 'USD',
            },
          },
        ],
      },
    };
    jest.spyOn(DefaultPaymentService.prototype, 'getPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

    const result = await paymentService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });

  test('create card payment', async () => {
    const createPaymentOpts: CreatePaymentRequest = {
      data: {
        paymentMethod: {
          type: PaymentMethodType.CARD,
        },
        paymentOutcome: PaymentOutcome.AUTHORIZED,
      },
    };
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultPaymentService.prototype, 'createPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(FastifyContext, 'getProcessorUrlFromContext').mockReturnValue('http://127.0.0.1');
    jest.spyOn(DefaultPaymentService.prototype, 'updatePayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));

    const result = await mockPaymentService.createPayment(createPaymentOpts);
    expect(result?.paymentReference).toStrictEqual('123456');
  });

  test('create invoice payment', async () => {
    const createPaymentOpts: CreatePaymentRequest = {
      data: {
        paymentMethod: {
          type: PaymentMethodType.INVOICE,
        },
        paymentOutcome: PaymentOutcome.AUTHORIZED,
      },
    };
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultPaymentService.prototype, 'createPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(FastifyContext, 'getProcessorUrlFromContext').mockReturnValue('http://127.0.0.1');
    jest.spyOn(DefaultPaymentService.prototype, 'updatePayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));

    const result = await mockPaymentService.createPayment(createPaymentOpts);
    expect(result?.paymentReference).toStrictEqual('123456');
  });

  test('create purchaseorder payment successfully', async () => {
    const createPaymentOpts: CreatePaymentRequest = {
      data: {
        paymentMethod: {
          type: PaymentMethodType.PURCHASE_ORDER,
          poNumber: '123456',
          invoiceMemo: 'This is a test invoice',
        },
        paymentOutcome: PaymentOutcome.AUTHORIZED,
      },
    };
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultPaymentService.prototype, 'createPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(FastifyContext, 'getProcessorUrlFromContext').mockReturnValue('http://127.0.0.1');
    jest.spyOn(DefaultPaymentService.prototype, 'updatePayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));

    const result = await mockPaymentService.createPayment(createPaymentOpts);
    expect(result?.paymentReference).toStrictEqual('123456');
  });

  test('create purchaseorder payment returns an error when PO number is not received', async () => {
    const createPaymentOpts: CreatePaymentRequest = {
      data: {
        paymentMethod: {
          type: PaymentMethodType.PURCHASE_ORDER,
        },
        paymentOutcome: PaymentOutcome.AUTHORIZED,
      },
    };
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultPaymentService.prototype, 'createPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(FastifyContext, 'getProcessorUrlFromContext').mockReturnValue('http://127.0.0.1');

    const resultPromise = mockPaymentService.createPayment(createPaymentOpts);

    await expect(resultPromise).rejects.toThrow('A value is required for field poNumber.');
  });

  describe('handleTransaction', () => {
    const customerId = '0e2a18f3-9f3b-4cef-83ab-6d892c95a0a8';
    const paymentMethodId = '997ff5fb-838b-4978-bf47-37a7de565820';

    const transactionDraft: TransactionDraftDTO = {
      cartId: 'dd4b7669-698c-4175-8e4c-bed178abfed3',
      checkoutTransactionItemId: '42251cfc-0660-4ab3-80f6-c32829aa7a8b',
      amount: {
        centAmount: 1000,
        currencyCode: 'EUR',
      },
      paymentMethodId,
      idempotencyKey: 'idempotency-key-value',
      type: 'Recurring',
    };

    const mockStoredPaymentMethod: PaymentMethod = {
      id: paymentMethodId,
      createdAt: '',
      lastModifiedAt: '',
      paymentMethodStatus: 'Active',
      version: 1,
      default: false,
      token: {
        value: 'mock-token-value',
      },
      method: 'card',
    };

    test('it should throw an ErrorInvalidField if the provided "type" value is unsupported', async () => {
      const invalidTransactionDraft: TransactionDraftDTO = {
        ...transactionDraft,
        type: 'UnknownType',
      } as unknown as TransactionDraftDTO;

      expect(mockPaymentService.handleTransaction(invalidTransactionDraft)).rejects.toThrow(
        new ErrorInvalidField('type', 'UnknownType', 'Recurring'),
      );
    });

    test('it should throw an ErrorInvalidField if the "type" value is not provided', async () => {
      const invalidTransactionDraft: TransactionDraftDTO = {
        ...transactionDraft,
        type: undefined,
      } as unknown as TransactionDraftDTO;

      expect(mockPaymentService.handleTransaction(invalidTransactionDraft)).rejects.toThrow(
        new ErrorInvalidField('type', 'not-provided', 'Recurring'),
      );
    });

    describe('Recurring', () => {
      test('it should throw an ErrorInvalidOperation if the stored-payment-methods feature is not enabled', async () => {
        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: false,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });

        expect(mockPaymentService.handleTransaction(transactionDraft)).rejects.toThrow(ErrorInvalidOperation);
      });

      test('it should throw an ErrorRequiredField if the provided cart does not have a customerId set', async () => {
        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: true,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });
        jest
          .spyOn(DefaultCartService.prototype, 'getCart')
          .mockResolvedValue({ ...mockGetCartResult(), customerId: undefined });

        expect(mockPaymentService.handleTransaction(transactionDraft)).rejects.toThrow(
          new ErrorRequiredField('customerId'),
        );
      });

      test('it should throw an ErrorInvalidField if the draft amount currency does not match the cart amount currency', async () => {
        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: true,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });
        jest.spyOn(DefaultCartService.prototype, 'getCart').mockResolvedValue({ ...mockGetCartResult(), customerId });
        jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockResolvedValue({
          centAmount: transactionDraft.amount.centAmount,
          currencyCode: 'USD',
          fractionDigits: 2,
        });

        expect(mockPaymentService.handleTransaction(transactionDraft)).rejects.toThrow(
          new ErrorInvalidField('amount.currencyCode', transactionDraft.amount.currencyCode, 'USD'),
        );
      });

      test('it should throw an ErrorInvalidField if the draft amount is greater than the cart amount', async () => {
        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: true,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });
        jest.spyOn(DefaultCartService.prototype, 'getCart').mockResolvedValue({ ...mockGetCartResult(), customerId });
        jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockResolvedValue({
          centAmount: transactionDraft.amount.centAmount - 1,
          currencyCode: transactionDraft.amount.currencyCode,
          fractionDigits: 2,
        });

        expect(mockPaymentService.handleTransaction(transactionDraft)).rejects.toThrow(
          new ErrorInvalidField(
            'amount.centAmount',
            String(transactionDraft.amount.centAmount),
            `<= ${transactionDraft.amount.centAmount - 1}`,
          ),
        );
      });

      test('it should throw an ErrorRequiredField if the paymentMethod referenced does not have a token value set', async () => {
        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: true,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });
        jest.spyOn(DefaultCartService.prototype, 'getCart').mockResolvedValue({ ...mockGetCartResult(), customerId });
        jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockResolvedValue({
          centAmount: transactionDraft.amount.centAmount,
          currencyCode: transactionDraft.amount.currencyCode,
          fractionDigits: 2,
        });
        jest.spyOn(DefaultPaymentMethodService.prototype, 'get').mockResolvedValue({
          ...mockStoredPaymentMethod,
          token: undefined,
        });

        expect(mockPaymentService.handleTransaction(transactionDraft)).rejects.toThrow(new ErrorRequiredField('token'));
      });

      test('should create the payment in CoCo and return it with a Completed state', async () => {
        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: true,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });
        jest.spyOn(DefaultCartService.prototype, 'getCart').mockResolvedValue({ ...mockGetCartResult(), customerId });
        jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockResolvedValue({
          centAmount: transactionDraft.amount.centAmount,
          currencyCode: transactionDraft.amount.currencyCode,
          fractionDigits: 2,
        });
        jest.spyOn(DefaultPaymentMethodService.prototype, 'get').mockResolvedValue(mockStoredPaymentMethod);
        jest
          .spyOn(DefaultPaymentService.prototype, 'createPayment')
          .mockReturnValueOnce(Promise.resolve(mockGetPaymentResult));
        jest
          .spyOn(DefaultCartService.prototype, 'addPayment')
          .mockReturnValueOnce(Promise.resolve(mockGetCartResult()));
        jest
          .spyOn(DefaultPaymentService.prototype, 'updatePayment')
          .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

        const resultPromise = mockPaymentService.handleTransaction(transactionDraft);
        expect(resultPromise).resolves.toStrictEqual({
          transactionStatus: {
            errors: [],
            state: 'Completed',
          },
          paymentId: mockUpdatePaymentResult.id,
        });
      });

      test('should create the payment in CoCo and return it with a Failed state', async () => {
        const failingTransactionDraft: TransactionDraftDTO = {
          ...transactionDraft,
          amount: {
            centAmount: 10000,
            currencyCode: 'EUR',
          },
        };

        jest.spyOn(StoredPaymentMethodsConfig, 'getStoredPaymentMethodsConfig').mockReturnValue({
          enabled: true,
          config: {
            paymentInterface: 'psp-template',
            allowedPaymentMethods: [PaymentMethodType.CARD],
          },
        });
        jest.spyOn(DefaultCartService.prototype, 'getCart').mockResolvedValue({ ...mockGetCartResult(), customerId });
        jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockResolvedValue({
          centAmount: failingTransactionDraft.amount.centAmount,
          currencyCode: failingTransactionDraft.amount.currencyCode,
          fractionDigits: 2,
        });
        jest.spyOn(DefaultPaymentMethodService.prototype, 'get').mockResolvedValue(mockStoredPaymentMethod);
        jest
          .spyOn(DefaultPaymentService.prototype, 'createPayment')
          .mockReturnValueOnce(Promise.resolve(mockGetPaymentResult));
        jest
          .spyOn(DefaultCartService.prototype, 'addPayment')
          .mockReturnValueOnce(Promise.resolve(mockGetCartResult()));
        jest
          .spyOn(DefaultPaymentService.prototype, 'updatePayment')
          .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

        const resultPromise = mockPaymentService.handleTransaction(failingTransactionDraft);

        expect(resultPromise).resolves.toStrictEqual({
          transactionStatus: {
            errors: [
              {
                code: 'PaymentRejected',
                message: `Payment '${mockGetPaymentResult.id}' has been rejected.`,
              },
            ],
            state: 'Failed',
          },
          paymentId: mockUpdatePaymentResult.id,
        });
      });
    });
  });

  describe('reversePayment', () => {
    test('it should fail because there are no transactions to revert', async () => {
      const modifyPaymentOpts: ModifyPayment = {
        paymentId: 'dummy-paymentId',
        data: {
          actions: [
            {
              action: 'reversePayment',
            },
          ],
        },
      };
      jest
        .spyOn(DefaultPaymentService.prototype, 'getPayment')
        .mockReturnValue(Promise.resolve(mockGetPaymentResultWithoutTransactions));
      jest
        .spyOn(DefaultPaymentService.prototype, 'updatePayment')
        .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));
      jest
        .spyOn(DefaultPaymentService.prototype, 'updatePayment')
        .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

      const result = paymentService.modifyPayment(modifyPaymentOpts);
      await expect(result).rejects.toThrow('There is no successful payment transaction to reverse.');
    });

    test('it should successfully revert transaction', async () => {
      const modifyPaymentOpts: ModifyPayment = {
        paymentId: 'dummy-paymentId',
        data: {
          actions: [
            {
              action: 'reversePayment',
            },
          ],
        },
      };
      jest.spyOn(DefaultPaymentService.prototype, 'getPayment').mockReturnValue(Promise.resolve(mockGetPaymentResult));
      jest
        .spyOn(DefaultPaymentService.prototype, 'updatePayment')
        .mockReturnValue(Promise.resolve(mockUpdatePaymentResultWithRefundTransaction));

      const result = await paymentService.modifyPayment(modifyPaymentOpts);
      expect(result?.outcome).toStrictEqual('approved');
    });
  });
});

import {
  statusHandler,
  healthCheckCommercetoolsPermissions,
  ErrorRequiredField,
  TransactionType,
  TransactionState,
  ErrorInvalidOperation,
  Cart,
} from '@commercetools/connect-payments-sdk';
import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  ConfigResponse,
  PaymentProviderModificationResponse,
  RefundPaymentRequest,
  ReversePaymentRequest,
  StatusResponse,
} from './types/operation.type';

import { SupportedPaymentComponentsSchemaDTO } from '../dtos/operations/payment-componets.dto';
import { PaymentModificationStatus } from '../dtos/operations/payment-intents.dto';
import packageJSON from '../../package.json';

import { AbstractPaymentService } from './abstract-payment.service';
import { getConfig } from '../config/config';
import { appLogger, paymentSDK } from '../payment-sdk';
import { CreatePaymentRequest, MockPaymentServiceOptions } from './types/mock-payment.type';
import { PaymentMethodType, PaymentOutcome, PaymentResponseSchemaDTO } from '../dtos/mock-payment.dto';
import { getCartIdFromContext, getPaymentInterfaceFromContext } from '../libs/fastify/context/context';
import { randomUUID } from 'crypto';
import { launchpadPurchaseOrderCustomType } from '../custom-types/custom-types';
import { TransactionDraftDTO, TransactionResponseDTO } from '../dtos/operations/transaction.dto';
import { getStoredPaymentMethodsConfig } from '../config/stored-payment-methods.config';
import { StoredPaymentMethod, StoredPaymentMethodsResponse } from '../dtos/stored-payment-methods.dto';
import { log } from '../libs/logger';

export class MockPaymentService extends AbstractPaymentService {
  constructor(opts: MockPaymentServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService, opts.ctPaymentMethodService);
  }

  /**
   * Indicates if the feature stored payment methods is enabled/available.
   * It can be enhanced with further checks if so required.
   */
  async isStoredPaymentMethodsEnabled(): Promise<boolean> {
    if (!getStoredPaymentMethodsConfig().enabled) {
      return false;
    }

    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    return ctCart.customerId !== undefined;
  }

  /**
   * Get configurations
   *
   * @remarks
   * Implementation to provide mocking configuration information
   *
   * @returns Promise with mocking object containing configuration information
   */
  public async config(): Promise<ConfigResponse> {
    const config = getConfig();

    return {
      clientKey: config.mockClientKey,
      environment: config.mockEnvironment,
      storedPaymentMethodsConfig: {
        isEnabled: await this.isStoredPaymentMethodsEnabled(),
      },
    };
  }

  /**
   * Get status
   *
   * @remarks
   * Implementation to provide mocking status of external systems
   *
   * @returns Promise with mocking data containing a list of status from different external systems
   */
  public async status(): Promise<StatusResponse> {
    const requiredPermissions = [
      'manage_payments',
      'view_sessions',
      'view_api_clients',
      'manage_orders',
      'introspect_oauth_tokens',
      'manage_checkout_payment_intents',
      'manage_types',
    ];

    if (getStoredPaymentMethodsConfig().enabled) {
      requiredPermissions.push('manage_payment_methods');
    }

    const handler = await statusHandler({
      timeout: getConfig().healthCheckTimeout,
      log: appLogger,
      checks: [
        healthCheckCommercetoolsPermissions({
          requiredPermissions,
          ctAuthorizationService: paymentSDK.ctAuthorizationService,
          projectKey: getConfig().projectKey,
        }),
        async () => {
          try {
            const paymentMethods = 'card';
            return {
              name: 'Mock Payment API',
              status: 'UP',
              message: 'Mock api is working',
              details: {
                paymentMethods,
              },
            };
          } catch (e) {
            return {
              name: 'Mock Payment API',
              status: 'DOWN',
              message: 'The mock paymentAPI is down for some reason. Please check the logs for more details.',
              details: {
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
        '@commercetools/connect-payments-sdk': packageJSON.dependencies['@commercetools/connect-payments-sdk'],
      }),
    })();

    return handler.body;
  }

  /**
   * Get supported payment components
   *
   * @remarks
   * Implementation to provide the mocking payment components supported by the processor.
   *
   * @returns Promise with mocking data containing a list of supported payment components
   */
  public async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
    return {
      dropins: [],
      components: [
        {
          type: PaymentMethodType.CARD,
        },
        {
          type: PaymentMethodType.CUSTOM_TEST_METHOD,
        },
        {
          type: PaymentMethodType.INVOICE,
        },
        {
          type: PaymentMethodType.PURCHASE_ORDER,
        },
      ],
      express: [
        {
          type: 'sample',
        },
      ],
    };
  }

  /**
   * Capture payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment capture in external PSPs
   *
   * @param request - contains the amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  public async capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
    await this.ctPaymentService.updatePayment({
      id: request.payment.id,
      transaction: {
        type: 'Charge',
        amount: request.amount,
        interactionId: request.payment.interfaceId,
        state: 'Success',
      },
    });
    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.payment.interfaceId as string };
  }

  /**
   * Cancel payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment cancel in external PSPs
   *
   * @param request - contains {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  public async cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
    await this.ctPaymentService.updatePayment({
      id: request.payment.id,
      transaction: {
        type: 'CancelAuthorization',
        amount: request.payment.amountPlanned,
        interactionId: request.payment.interfaceId,
        state: 'Success',
      },
    });
    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.payment.interfaceId as string };
  }

  /**
   * Refund payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment refund in external PSPs
   *
   * @param request - contains amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  public async refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse> {
    await this.ctPaymentService.updatePayment({
      id: request.payment.id,
      transaction: {
        type: 'Refund',
        amount: request.amount,
        interactionId: request.payment.interfaceId,
        state: 'Success',
      },
    });
    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.payment.interfaceId as string };
  }

  /**
   * Reverse payment
   *
   * @remarks
   * Abstract method to execute payment reversals in support of automated reversals to be triggered by checkout api. The actual invocation to PSPs should be implemented in subclasses
   *
   * @param request
   * @returns Promise with outcome containing operation status and PSP reference
   */
  public async reversePayment(request: ReversePaymentRequest): Promise<PaymentProviderModificationResponse> {
    const hasCharge = this.ctPaymentService.hasTransactionInState({
      payment: request.payment,
      transactionType: 'Charge',
      states: ['Success'],
    });
    const hasRefund = this.ctPaymentService.hasTransactionInState({
      payment: request.payment,
      transactionType: 'Refund',
      states: ['Success', 'Pending'],
    });
    const hasCancelAuthorization = this.ctPaymentService.hasTransactionInState({
      payment: request.payment,
      transactionType: 'CancelAuthorization',
      states: ['Success', 'Pending'],
    });

    const wasPaymentReverted = hasRefund || hasCancelAuthorization;

    if (hasCharge && !wasPaymentReverted) {
      return this.refundPayment({
        payment: request.payment,
        merchantReference: request.merchantReference,
        amount: request.payment.amountPlanned,
      });
    }

    const hasAuthorization = this.ctPaymentService.hasTransactionInState({
      payment: request.payment,
      transactionType: 'Authorization',
      states: ['Success'],
    });
    if (hasAuthorization && !wasPaymentReverted) {
      return this.cancelPayment({ payment: request.payment });
    }

    throw new ErrorInvalidOperation('There is no successful payment transaction to reverse.');
  }

  /**
   * Create payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment creation in external PSPs
   *
   * @param request - contains paymentType defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  public async createPayment(request: CreatePaymentRequest): Promise<PaymentResponseSchemaDTO> {
    this.validatePaymentMethod(request);

    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const ctPayment = await this.ctPaymentService.createPayment({
      amountPlanned: await this.ctCartService.getPaymentAmount({
        cart: ctCart,
      }),
      paymentMethodInfo: {
        paymentInterface: getPaymentInterfaceFromContext() || 'mock',
      },
      ...(ctCart.customerId && {
        customer: {
          typeId: 'customer',
          id: ctCart.customerId,
        },
      }),
      ...(!ctCart.customerId &&
        ctCart.anonymousId && {
          anonymousId: ctCart.anonymousId,
        }),
    });

    await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    // Fetch the required data and then validate it before making the request to the PSP.
    const storedPaymentMethodDataOptions = await this.handleStoredPaymentMethod(request, ctCart);

    // Perform request to PSP

    // Depending on the PSP integration the creation of the CT stored payment method could happen in one of two ways:
    // 1. sync based on the response from the PSP when the payment is created and authorized.
    // 2. async via a webhook/notification from the PSP after the payment is created and authorized.
    if (
      request.data.paymentOutcome === PaymentOutcome.AUTHORIZED &&
      ctCart.customerId &&
      storedPaymentMethodDataOptions.storePaymentMethod
    ) {
      // In this example it will be directly created as described in option 1.
      await this.ctPaymentMethodService.save({
        customerId: ctCart.customerId,
        method: request.data.paymentMethod.type,
        paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
        interfaceAccount: getStoredPaymentMethodsConfig().config.interfaceAccount,
        token: randomUUID(), // This value should always come from the PSP after they have authorized the payment
      });
    }

    const pspReference = randomUUID().toString();

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: pspReference,
      paymentMethod: request.data.paymentMethod.type,
      transaction: {
        type: 'Authorization',
        amount: ctPayment.amountPlanned,
        interactionId: pspReference,
        state: this.convertPaymentResultCode(request.data.paymentOutcome),
      },
      ...(request.data.paymentMethod.type === PaymentMethodType.PURCHASE_ORDER && {
        customFields: {
          type: {
            key: launchpadPurchaseOrderCustomType.key,
            typeId: 'type',
          },
          fields: {
            [launchpadPurchaseOrderCustomType.purchaseOrderNumber]: request.data.paymentMethod.poNumber,
            [launchpadPurchaseOrderCustomType.invoiceMemo]: request.data.paymentMethod.invoiceMemo,
          },
        },
      }),
    });

    return {
      paymentReference: updatedPayment.id,
    };
  }

  /**
   * Before the create payment request to the PSP is made the input needs to be validated first and then passed to the PSP to either tokenise or pay with a token.
   * Depending on how the PSP integration works the return value of this function could differ or other requirements surrounding the API calls.
   * However the core principle of logic and validations would be the same.
   */
  async handleStoredPaymentMethod(
    request: CreatePaymentRequest,
    ctCart: Cart,
  ): Promise<{ storePaymentMethod?: boolean; token?: string }> {
    // Feature itself must be enabled on connector level by the merchant
    if (!getStoredPaymentMethodsConfig().enabled) {
      return {};
    }

    // The payment method must be allowed to be tokenised
    if (!getStoredPaymentMethodsConfig().config.allowedPaymentMethods.includes(request.data.paymentMethod.type)) {
      return {};
    }

    // Now it's important to validate what the user wants to do with regards to stored-payment-methods. It could either be:
    // 1. Nothing;
    // 2. Tokenise a payment method;
    // 3. Pay with a stored-payment-method.
    // Those values come from the enabler UI where the decided what to do.

    const storePaymentMethodFirstTime = request.data.paymentMethod.storePaymentMethod !== undefined;

    const storedPaymentMethodId = request.data.paymentMethod.storedPaymentMethodId;
    const payWithExistingStoredPaymentMethod = storedPaymentMethodId !== undefined;

    if (!storePaymentMethodFirstTime && !payWithExistingStoredPaymentMethod) {
      // User does not want to do anything related to stored-payment-methods.
      return {};
    }

    if (storePaymentMethodFirstTime && payWithExistingStoredPaymentMethod) {
      // This scenario should never happen. If the enabler indicates it wants to pay and tokenise at the same time there is most likely an implementation error.
      return {};
    }

    // The cart needs to have a customerId set if the incoming request indicated that it wants to either pay or tokenise
    if (!ctCart.customerId) {
      throw new ErrorRequiredField('customerId', {
        privateMessage: 'The customerId is not set on the cart yet the customer wants to tokenize the payment',
        privateFields: {
          cart: {
            id: ctCart.id,
            typeId: 'cart',
          },
        },
      });
    }

    if (storePaymentMethodFirstTime) {
      // The user has indicated that it wants to tokenise the payment. Forward this intent to the PSP.
      return { storePaymentMethod: storePaymentMethodFirstTime };
    } else if (payWithExistingStoredPaymentMethod) {
      // The user has selected a existing stored-payment-method to pay with from the enabler/UI.

      // It's important to verify if the given payment-method id from the enabler request actually belongs to the `customerId` that is set on the `cart`.
      // This can be achieved by fetching the payment-method from CT using the payment-methods service from the connect-payments-sdk.

      const paymentMethod = await this.ctPaymentMethodService.get({
        customerId: ctCart.customerId,
        paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
        interfaceAccount: getStoredPaymentMethodsConfig().config.interfaceAccount,
        id: storedPaymentMethodId,
      });

      // Due note that it could be that the PSP integration works by sending the actual token value from the enabler components to the `/payments` API in the processor.
      // In this case one of the two following approaches can be chosen to achieve the same validation:
      // const paymentMethod = await this.ctPaymentMethodService.getByTokenValue({
      //   customerId: ctCart.customerId,
      //   paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
      //   interfaceAccount: getStoredPaymentMethodsConfig().config.interfaceAccount,
      //   tokenValue: '<value from the incoming request body>',
      // });
      //
      // ### OR
      //
      // const belongsToCustomer = await this.ctPaymentMethodService.doesTokenBelongsToCustomer({
      //   customerId: ctCart.customerId,
      //   paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
      //   interfaceAccount: getStoredPaymentMethodsConfig().config.interfaceAccount,
      //   tokenValue: '<value from the request body>',
      // });
      //
      // if (!belongsToCustomer) {
      //   // Take appropiate action
      // }

      // Send the "paymentMethod.token.value" attribute to the PSP in order to pay with an tokenised payment method
      return { token: paymentMethod.token?.value };
    }

    return {};
  }

  /**
   * Returns "cart.customerId" from the cart that is present in the context. If the "cart.customerId" is not set then a "ErrorRequiredField" will be thrown.
   */
  async getCustomerIdFromCart(): Promise<string> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const customerId = ctCart.customerId;

    if (!customerId) {
      throw new ErrorRequiredField('customerId', {
        privateMessage: 'customerId is not set on the cart',
        privateFields: {
          cart: {
            id: ctCart.id,
          },
        },
      });
    }

    return customerId;
  }

  /**
   * Returns a list of stored-payment-methods that are available in the current session.
   *
   */
  async getStoredPaymentMethods(): Promise<StoredPaymentMethodsResponse> {
    // First fetch the customerId from the cart
    const customerId = await this.getCustomerIdFromCart();

    // Then fetch all known stored-payment-methods from CT. Using the `paymentInterface` and `interfaceAccount` it will only return stored-payment-methods that match with this connectors configuration.
    const storedPaymentMethods = await this.ctPaymentMethodService.find({
      customerId: customerId,
      paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
      interfaceAccount: getStoredPaymentMethodsConfig().config.interfaceAccount,
    });

    // Map over the payment methods and include displayable friendly data for Checkout to use.
    return {
      storedPaymentMethods: storedPaymentMethods.results.map((spm) => {
        const res: StoredPaymentMethod = {
          id: spm.id,
          createdAt: spm.createdAt,
          isDefault: spm.default,
          token: spm.token?.value || '',
          type: spm.method || '',
          // The displayOptions is optional but will be used for displaying this data in the UI. Must be enhanced from with data from the PSP since that is not (yet) stored on the payment-methods in CT.
          // Due to the fact that this template connector does not have a actual PSP attached it's not possible to now these values from just the CT payment-methods. For now return some dummy static data.
          displayOptions: {
            brand: {
              key: 'visa',
            },
            endDigits: '1111',
            expiryMonth: 3,
            expiryYear: 30,
          },
        };

        return res;
      }),
    };
  }

  async deleteStoredPaymentMethodViaCart(id: string): Promise<void> {
    const customerId = await this.getCustomerIdFromCart();

    await this.deleteStoredPaymentMethod(id, customerId);
  }

  /**
   * Deletes the stored payment method by ID and customerId
   */
  async deleteStoredPaymentMethod(id: string, customerId: string): Promise<void> {
    const paymentMethod = await this.ctPaymentMethodService.get({
      customerId: customerId,
      paymentInterface: getStoredPaymentMethodsConfig().config.paymentInterface,
      interfaceAccount: getStoredPaymentMethodsConfig().config.interfaceAccount,
      id,
    });

    try {
      await this.ctPaymentMethodService.delete({
        customerId: customerId,
        id: paymentMethod.id,
        version: paymentMethod.version,
      });

      log.info('Successfully deleted payment-method in CT', {
        customer: { id: customerId, type: 'customer' },
        paymentMethod: { id: paymentMethod.id, type: 'payment-method', version: paymentMethod.version },
      });
    } catch (error) {
      log.error('Could not delete payment-method in CT', {
        error,
        customer: { id: customerId, type: 'customer' },
        paymentMethod: { id: paymentMethod.id, type: 'payment-method' },
      });

      throw error;
    }

    // After a successful deletion of the stored payment method in CT. Perform any delete operation on the side of the PSP.
    // For Checkout perspective it's intended that the payment-method in CT is removed first and only if that succeeds proceed to remove it from the PSP.
  }

  public async handleTransaction(transactionDraft: TransactionDraftDTO): Promise<TransactionResponseDTO> {
    const TRANSACTION_AUTHORIZATION_TYPE: TransactionType = 'Authorization';
    const TRANSACTION_STATE_SUCCESS: TransactionState = 'Success';
    const TRANSACTION_STATE_FAILURE: TransactionState = 'Failure';

    const maxCentAmountIfSuccess = 10000;

    const ctCart = await this.ctCartService.getCart({ id: transactionDraft.cartId });

    let amountPlanned = transactionDraft.amount;
    if (!amountPlanned) {
      amountPlanned = await this.ctCartService.getPaymentAmount({ cart: ctCart });
    }

    const isBelowSuccessStateThreshold = amountPlanned.centAmount < maxCentAmountIfSuccess;

    const newlyCreatedPayment = await this.ctPaymentService.createPayment({
      amountPlanned,
      paymentMethodInfo: {
        paymentInterface: transactionDraft.paymentInterface,
      },
    });

    await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: newlyCreatedPayment.id,
    });

    const transactionState: TransactionState = isBelowSuccessStateThreshold
      ? TRANSACTION_STATE_SUCCESS
      : TRANSACTION_STATE_FAILURE;

    const pspReference = randomUUID().toString();

    await this.ctPaymentService.updatePayment({
      id: newlyCreatedPayment.id,
      pspReference: pspReference,
      transaction: {
        amount: amountPlanned,
        type: TRANSACTION_AUTHORIZATION_TYPE,
        state: transactionState,
        interactionId: pspReference,
      },
    });

    if (isBelowSuccessStateThreshold) {
      return {
        transactionStatus: {
          errors: [],
          state: 'Pending',
        },
      };
    } else {
      return {
        transactionStatus: {
          errors: [
            {
              code: 'PaymentRejected',
              message: `Payment '${newlyCreatedPayment.id}' has been rejected.`,
            },
          ],
          state: 'Failed',
        },
      };
    }
  }

  private convertPaymentResultCode(resultCode: PaymentOutcome): string {
    switch (resultCode) {
      case PaymentOutcome.AUTHORIZED:
        return 'Success';
      case PaymentOutcome.REJECTED:
        return 'Failure';
      default:
        return 'Initial';
    }
  }

  private validatePaymentMethod(request: CreatePaymentRequest): void {
    const { paymentMethod } = request.data;

    if (paymentMethod.type === PaymentMethodType.PURCHASE_ORDER && !paymentMethod.poNumber) {
      throw new ErrorRequiredField('poNumber');
    }
  }
}

import { PaymentResponse } from '@adyen/api-library/lib/src/typings/checkout/paymentResponse';
import { CommercetoolsCartService, CommercetoolsPaymentService,  } from '@commercetools/connect-payments-sdk';
import { Cart } from '@commercetools/platform-sdk';
import { AdyenAPI } from '../clients/adyen/adyen.client';
import {
  PaymentConfirmationData,
  PaymentData,
  PaymentMethodsData,
  PaymentModificationResponseDTO,
  PaymentModificationStatus,
  SessionData,
} from '../dtos/payment.dto';
import { CancelPaymentConverter } from './converters/cancel-payment.converter';
import { CapturePaymentConverter } from './converters/capture-payment.converter';
import { ConfirmPaymentConverter } from './converters/confirm-payment.converter';
import { CreatePaymentConverter } from './converters/create-payment.converter';
import { CreateSessionConverter } from './converters/create-session.converter';
import { PaymentMethodsConverter } from './converters/payment-methods.converter';
import { RefundPaymentConverter } from './converters/refund-payment.converter';
import {
  CancelPayment,
  CapturePayment,
  ConfirmPayment,
  CreatePayment,
  CreateSession,
  GetPaymentMethods,
  PaymentService,
  PaymentServiceOptions,
  RefundPayment,
} from './types/payment.type';
import { getSessionContext } from '../libs/fastify/context/context';

export class DefaultPaymentService implements PaymentService {
  private ctCartService: CommercetoolsCartService;
  private ctPaymentService: CommercetoolsPaymentService;
  private paymentMethodsConverter: PaymentMethodsConverter;
  private createSessionConverter: CreateSessionConverter;
  private createPaymentConverter: CreatePaymentConverter;
  private confirmPaymentConverter: ConfirmPaymentConverter;
  private cancelPaymentConverter: CancelPaymentConverter;
  private capturePaymentConverter: CapturePaymentConverter;
  private refundPaymentConverter: RefundPaymentConverter;

  constructor(opts: PaymentServiceOptions) {
    this.ctCartService = opts.ctCartService;
    this.ctPaymentService = opts.ctPaymentService;
    this.paymentMethodsConverter = new PaymentMethodsConverter(opts.ctCartService);
    this.createSessionConverter = new CreateSessionConverter();
    this.createPaymentConverter = new CreatePaymentConverter();
    this.confirmPaymentConverter = new ConfirmPaymentConverter();
    this.cancelPaymentConverter = new CancelPaymentConverter();
    this.capturePaymentConverter = new CapturePaymentConverter();
    this.refundPaymentConverter = new RefundPaymentConverter();
  }

  public async getPaymentMethods(opts: GetPaymentMethods): Promise<PaymentMethodsData> {
    const data = await this.paymentMethodsConverter.convert({
      data: opts.data,
      cartId: getSessionContext().cartId,
    });

    const res = await AdyenAPI().PaymentsApi.paymentMethods(data);

    return this.paymentMethodsConverter.convertResponse({
      data: res,
    });
  }

  public async createSession(opts: CreateSession): Promise<SessionData> {
    const ctCart = await this.ctCartService.getCart({
      id: getSessionContext().cartId,
    });

    //TODO: get payment amount from request and validate in the BE or get it directly in the BE
    const ctPayment = await this.ctPaymentService.createPayment({
      amountPlanned: this.ctCartService.getPaymentAmount({
        cart: ctCart,
      }),
      paymentMethodInfo: {
        paymentInterface: 'adyen-connect',
      },
      ...(ctCart.customerId && {
        customer: {
          typeId: 'customer',
          id: ctCart.customerId,
        },
      }),
    });

    const updateCart = await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    //TODO: amount cart != amount payment => update payment amount?

    const data = await this.createSessionConverter.convert({
      data: opts.data,
      cart: updateCart as Cart,
      payment: ctPayment,
    });

    try {
      const res = await AdyenAPI().PaymentsApi.sessions(data);

      //TODO: save PSP interaction
      return {
        sessionData: res,
        paymentReference: ctPayment.id,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async createPayment(opts: CreatePayment): Promise<PaymentData> {
    let ctCart, ctPayment;
    ctCart = await this.ctCartService.getCart({
      id: getSessionContext().cartId,
    });

    if (opts.data.paymentReference) {
      ctPayment = await this.ctPaymentService.getPayment({
        id: opts.data.paymentReference,
      });
    } else {
      ctPayment = await this.ctPaymentService.createPayment({
        amountPlanned: this.ctCartService.getPaymentAmount({
          cart: ctCart,
        }),
        paymentMethodInfo: {
          paymentInterface: 'adyen-connect',
        },
        ...(ctCart.customerId && {
          customer: {
            typeId: 'customer',
            id: ctCart.customerId,
          },
        }),
      });

      ctCart = await this.ctCartService.addPayment({
        resource: {
          id: ctCart.id,
          version: ctCart.version,
        },
        paymentId: ctPayment.id,
      });
    }

    //TODO: consolidate payment amount if needed

    const data = await this.createPaymentConverter.convert({
      data: opts.data,
      cart: ctCart,
      payment: ctPayment,
    });

    const res = await AdyenAPI().PaymentsApi.payments(data);

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: res.pspReference,
      paymentMethod: res.paymentMethod?.type,
      transaction: {
        type: 'Authorization',
        amount: ctPayment.amountPlanned,
        interactionId: res.pspReference,
        state: this.convertAdyenResultCode(res.resultCode as PaymentResponse.ResultCodeEnum),
      },
    });

    return {
      resultCode: res.resultCode,
      action: res.action,
      threeDS2Result: res.threeDS2Result,
      threeDS2ResponseData: res.threeDS2ResponseData,
      threeDSPaymentData: res.threeDSPaymentData,
      paymentReference: updatedPayment.id,
    };
  }

  public async confirmPayment(opts: ConfirmPayment): Promise<PaymentConfirmationData> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.data.paymentReference,
    });

    const data = await this.confirmPaymentConverter.convert({
      data: opts.data,
    });
    const res = await AdyenAPI().PaymentsApi.paymentsDetails(data);

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: res.pspReference,
      paymentMethod: res.paymentMethod?.type,
      transaction: {
        type: 'Authorization',
        amount: ctPayment.amountPlanned,
        interactionId: res.pspReference,
        state: this.convertAdyenResultCode(res.resultCode as PaymentResponse.ResultCodeEnum),
      },
    });

    return {
      resultCode: res.resultCode,
      threeDS2Result: res.threeDS2Result,
      threeDS2ResponseData: res.threeDS2ResponseData,
      threeDSPaymentData: res.threeDSPaymentData,
      paymentReference: updatedPayment.id,
    };
  }

  public async cancelPayment(opts: CancelPayment): Promise<PaymentModificationResponseDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });

    const data = await this.cancelPaymentConverter.convert({ payment: ctPayment });

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: 'CancelAuthorization',
        amount: ctPayment.amountPlanned,
        state: 'Initial',
      },
    });

    const res = await AdyenAPI().ModificationsApi.cancelAuthorisedPaymentByPspReference(
      ctPayment.interfaceId as string,
      data,
    );

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: 'CancelAuthorization',
        amount: ctPayment.amountPlanned,
        interactionId: res.pspReference,
        state: 'Pending',
      },
    });

    return {
      status: PaymentModificationStatus.RECEIVED,
    };
  }

  public async capturePayment(opts: CapturePayment): Promise<PaymentModificationResponseDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });

    const data = await this.capturePaymentConverter.convert({ payment: ctPayment, data: opts.data });

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: 'Charge',
        amount: {
          currencyCode: data.amount.currency,
          centAmount: data.amount.value,
        },
        state: 'Initial',
      },
    });

    const res = await AdyenAPI().ModificationsApi.captureAuthorisedPayment(ctPayment.interfaceId as string, data);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: 'Charge',
        amount: {
          currencyCode: data.amount.currency,
          centAmount: data.amount.value,
        },
        interactionId: res.pspReference,
        state: 'Pending',
      },
    });

    return {
      status: PaymentModificationStatus.RECEIVED,
    };
  }

  public async refundPayment(opts: RefundPayment): Promise<PaymentModificationResponseDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });

    const data = await this.refundPaymentConverter.convert({ payment: ctPayment, data: opts.data });

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: 'Refund',
        amount: {
          currencyCode: data.amount.currency,
          centAmount: data.amount.value,
        },
        state: 'Initial',
      },
    });

    const res = await AdyenAPI().ModificationsApi.refundCapturedPayment(ctPayment.interfaceId as string, data);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: 'Refund',
        amount: {
          currencyCode: data.amount.currency,
          centAmount: data.amount.value,
        },
        interactionId: res.pspReference,
        state: 'Pending',
      },
    });

    return {
      status: PaymentModificationStatus.RECEIVED,
    };
  }

  private convertAdyenResultCode(resultCode: PaymentResponse.ResultCodeEnum): string {
    switch (resultCode) {
      case PaymentResponse.ResultCodeEnum.Authorised:
        return 'Success'; //TODO: review and confirm
      case PaymentResponse.ResultCodeEnum.Pending:
        return 'Pending';
      case PaymentResponse.ResultCodeEnum.Refused:
      case PaymentResponse.ResultCodeEnum.Error:
      case PaymentResponse.ResultCodeEnum.Cancelled:
        return 'Failure';
      default:
        return 'Initial';
    }
  }
}

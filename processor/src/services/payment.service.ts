import { CommercetoolsCartService, CommercetoolsPaymentService,  } from '@commercetools/connect-payments-sdk';
import { paymentProviderApi } from '../clients/client';
import {
  CreatePayment,
  PaymentService,
  PaymentServiceOptions
} from './types/payment.type';
import { getSessionContext } from '../libs/fastify/context/context';
import {paymentOutcome, PaymentResponseSchemaDTO} from '../dtos/payment.dto';

export class DefaultPaymentService implements PaymentService {
  private ctCartService: CommercetoolsCartService;
  private ctPaymentService: CommercetoolsPaymentService;

  constructor(opts: PaymentServiceOptions) {
    this.ctCartService = opts.ctCartService;
    this.ctPaymentService = opts.ctPaymentService;
  }

  // TODO

  // public async createSession(opts: CreateSession): Promise<SessionData> {
  //   const ctCart = await this.ctCartService.getCart({
  //     id: getSessionContext().cartId,
  //   });
  //
  //   //TODO: get payment amount from request and validate in the BE or get it directly in the BE
  //   const ctPayment = await this.ctPaymentService.createPayment({
  //     amountPlanned: this.ctCartService.getPaymentAmount({
  //       cart: ctCart,
  //     }),
  //     paymentMethodInfo: {
  //       paymentInterface: 'adyen-connect',
  //     },
  //     ...(ctCart.customerId && {
  //       customer: {
  //         typeId: 'customer',
  //         id: ctCart.customerId,
  //       },
  //     }),
  //   });
  //
  //   const updateCart = await this.ctCartService.addPayment({
  //     resource: {
  //       id: ctCart.id,
  //       version: ctCart.version,
  //     },
  //     paymentId: ctPayment.id,
  //   });
  //
  //   //TODO: amount cart != amount payment => update payment amount?
  //
  //   const data = await this.createSessionConverter.convert({
  //     data: opts.data,
  //     cart: updateCart as Cart,
  //     payment: ctPayment,
  //   });
  //
  //   try {
  //     const res = await paymentProviderApi().PaymentsApi.sessions(data);
  //
  //     //TODO: save PSP interaction
  //     return {
  //       sessionData: res,
  //       paymentReference: ctPayment.id,
  //     };
  //   } catch (e) {
  //     console.log(e);
  //     throw e;
  //   }
  // }

  public async createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO> {
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
          paymentInterface: 'mock-payment',
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
    const data = {
      data: opts.data,
      cart: ctCart,
      payment: ctPayment,
    };

    const res = await paymentProviderApi().PaymentsApi.payments(data);

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: res.pspReference,
      paymentMethod: res.paymentMethod?.type,
      transaction: {
        type: 'Authorization',
        amount: ctPayment.amountPlanned,
        interactionId: res.pspReference,
        state: this.convertPaymentResultCode(res.resultCode as paymentOutcome),
      },
    });

    return {
      outcome: res.resultCode,
      paymentReference: updatedPayment.id,
    };
  }

  private convertPaymentResultCode(resultCode: paymentOutcome): string {
    switch (resultCode) {
      case paymentOutcome.AUTHORIZED:
        return 'Success';
      case paymentOutcome.REJECTED:
        return 'Failure';
      default:
        return 'Initial';
    }
  }
}

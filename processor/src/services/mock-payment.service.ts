import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { PaymentOutcome, PaymentResponseSchemaDTO } from '../dtos/mock-payment.dto';

import { randomUUID } from 'crypto';
import { getCartIdFromContext } from '../libs/fastify/context/context';
import { CreatePayment } from './types/mock-payment.type';

export type MockPaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

export class MockPaymentService {
  private ctCartService: CommercetoolsCartService;
  private ctPaymentService: CommercetoolsPaymentService;
  private allowedCreditCards = ['4111111111111111', '5555555555554444', '341925950237632'];

  constructor(opts: MockPaymentServiceOptions) {
    this.ctCartService = opts.ctCartService;
    this.ctPaymentService = opts.ctPaymentService;
  }

  private isCreditCardAllowed(cardNumber: string) {
    return this.allowedCreditCards.includes(cardNumber);
  }

  public async createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const ctPayment = await this.ctPaymentService.createPayment({
      amountPlanned: await this.ctCartService.getPaymentAmount({
        cart: ctCart,
      }),
      paymentMethodInfo: {
        paymentInterface: 'mock',
      },
      ...(ctCart.customerId && {
        customer: {
          typeId: 'customer',
          id: ctCart.customerId,
        },
      }),
    });

    await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    const paymentMethod = opts.data.paymentMethod;
    const isAuthorized = this.isCreditCardAllowed(paymentMethod.cardNumber);

    const resultCode = isAuthorized ? PaymentOutcome.AUTHORIZED : PaymentOutcome.REJECTED;

    const pspReference = randomUUID().toString();

    const paymentMethodType = paymentMethod.type;

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: pspReference,
      paymentMethod: paymentMethodType,
      transaction: {
        type: 'Authorization',
        amount: ctPayment.amountPlanned,
        interactionId: pspReference,
        state: this.convertPaymentResultCode(resultCode as PaymentOutcome),
      },
    });

    return {
      outcome: resultCode,
      paymentReference: updatedPayment.id,
    };
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
}

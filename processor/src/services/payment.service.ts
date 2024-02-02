import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { paymentProviderApi } from '../clients/mockPaymentAPI';
import { CreatePayment, PaymentService, PaymentServiceOptions } from './types/payment.type';
import { PaymentOutcome, PaymentResponseSchemaDTO } from '../dtos/payment.dto';
import { getCartIdFromContext } from '../libs/fastify/context/context';

export class DefaultPaymentService implements PaymentService {
  private ctCartService: CommercetoolsCartService;
  private ctPaymentService: CommercetoolsPaymentService;

  constructor(opts: PaymentServiceOptions) {
    this.ctCartService = opts.ctCartService;
    this.ctPaymentService = opts.ctPaymentService;
  }

  public async createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO> {
    let ctCart;
    ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const ctPayment = await this.ctPaymentService.createPayment({
      amountPlanned: this.ctCartService.getPaymentAmount({
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

    ctCart = await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    // TODO: consolidate payment amount if needed
    const data = {
      data: opts.data,
      cart: ctCart,
      payment: ctPayment,
    };

    const res = await paymentProviderApi().processPayment(data);

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: res.pspReference,
      paymentMethod: res.paymentMethodType,
      transaction: {
        type: 'Authorization',
        amount: ctPayment.amountPlanned,
        interactionId: res.pspReference,
        state: this.convertPaymentResultCode(res.resultCode as PaymentOutcome),
      },
    });

    return {
      outcome: res.resultCode,
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

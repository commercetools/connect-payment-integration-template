import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  CreatePayment, ModifyPayment,
  PaymentService,
  PaymentServiceOptions
} from './types/payment.type';
import {
  PaymentModificationResponseDTO,
  PaymentModificationStatus,
  PaymentOutcome,
  PaymentResponseSchemaDTO
} from '../dtos/payment.dto';
import { getCartIdFromContext } from '../libs/fastify/context/context';
import {PaymentConnector} from "../clients/PaymentConnector";
import {MockPaymentConnector} from "../clients/MockPaymentConnector";
import {Payment} from "@commercetools/platform-sdk";

export class DefaultPaymentService implements PaymentService {
  private ctCartService: CommercetoolsCartService;
  private ctPaymentService: CommercetoolsPaymentService;
  private paymentConnector: PaymentConnector = new MockPaymentConnector();

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


    const res = await this.paymentConnector.processPayment(data);

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

  public async modifyPayment(opts: ModifyPayment): Promise<PaymentModificationResponseDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });

    const transactionType = this.getPaymentTransactionType(opts.data.action);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: transactionType,
        amount: ctPayment.amountPlanned,
        state: 'Initial',
      },
    });

    const res = await this.processPaymentModification(transactionType, ctPayment);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: transactionType,
        amount: ctPayment.amountPlanned,
        interactionId: res.pspReference,
        state: 'Success',
      },
    });

    return {
      outcome: PaymentModificationStatus.APPROVED,
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

  private getPaymentTransactionType(action: string): string {
    switch (action) {
      case 'cancelPayment': {
        return 'CancelAuthorization';
      }
      case 'capturePayment': {
        return 'Charge';
      }
      case 'refundPayment': {
        return 'Refund';
      }
    }
  }

  private async processPaymentModification(transactionType: string, ctPayment: Payment) {
    switch (transactionType) {
      case 'CancelAuthorization': {
        return await this.paymentConnector.cancelPayment(
            ctPayment.interfaceId as string,
            ctPayment,
        );
      }
      case 'Charge': {
        return await this.paymentConnector.capturePayment(
            ctPayment.interfaceId as string,
            ctPayment,
        );
      }
      case 'Refund': {
        return await this.paymentConnector.refundPayment(
            ctPayment.interfaceId as string,
            ctPayment,
        );
      }
    }
  }

}

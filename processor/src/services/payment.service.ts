import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  CreatePayment, ModifyPayment,
  PaymentService,
  PaymentServiceOptions, RequestAmount
} from './types/payment.type';
import {
  PaymentIntentUpdateResponseDTO,
  PaymentModificationStatus,
  PaymentOutcome,
  PaymentResponseSchemaDTO
} from '../dtos/payment.dto';
import { getCartIdFromContext } from '../libs/fastify/context/context';

import { SupportedPaymentComponentsSchemaDTO } from '../dtos/payment-methods.dto';
import { MockPaymentConnector } from "../clients/MockPaymentConnector";
import { DefaultMockPaymentConnector } from "../clients/DefaultMockPaymentConnector";


export class DefaultPaymentService implements PaymentService {
  private ctCartService: CommercetoolsCartService;
  private ctPaymentService: CommercetoolsPaymentService;
  private paymentConnector: MockPaymentConnector = new DefaultMockPaymentConnector();

  constructor(opts: PaymentServiceOptions) {
    this.ctCartService = opts.ctCartService;
    this.ctPaymentService = opts.ctPaymentService;
  }

  public async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
    return {
      components: [
        {
          type: 'card',
        },
      ],
    };
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

    await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    const data = {
      data: opts.data,
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

  public async modifyPayment(opts: ModifyPayment): Promise<PaymentIntentUpdateResponseDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });

    const request = opts.data.actions[0];

    let requestAmount!: RequestAmount;
    if ( request.action != "cancelPayment" ) {
      requestAmount = request.amount;
    }

    const transactionType = this.getPaymentTransactionType(request.action);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: transactionType,
        amount: ctPayment.amountPlanned,
        state: 'Initial',
      },
    });

    const res = await this.processPaymentModification(
        transactionType, ctPayment.interfaceId as string, requestAmount);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: transactionType,
        amount: ctPayment.amountPlanned,
        interactionId: res?.pspReference,
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
      // TODO: Handle Error case
      default : {
        return '';
      }
    }
  }

  private async processPaymentModification(transactionType: string,
                                           pspReference: string,
                                           requestAmount: RequestAmount) {
    switch (transactionType) {
      case 'CancelAuthorization': {
        return await this.paymentConnector.cancelPayment(
            { pspReference }
        );
      }
      case 'Charge': {
        return await this.paymentConnector.capturePayment(
            { amount : requestAmount, pspReference }
        );
      }
      case 'Refund': {
        return await this.paymentConnector.refundPayment(
            { amount : requestAmount, pspReference }
        );
      }
    }
  }

}

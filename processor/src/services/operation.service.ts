import {
  CommercetoolsPaymentService,
  ErrorInvalidJsonInput,
  ErrorInvalidOperation,
} from '@commercetools/connect-payments-sdk';
import { ModifyPayment, OperationService, OperationServiceOptions } from './types/operation.type';

import { ConfigResponseSchemaDTO } from '../dtos/operations/config.dto';
import { SupportedPaymentComponentsSchemaDTO } from '../dtos/operations/payment-componets.dto';
import {
  AmountSchemaDTO,
  PaymentIntentResponseSchemaDTO,
  PaymentModificationStatus,
} from '../dtos/operations/payment-intents.dto';
import { StatusResponseSchemaDTO } from '../dtos/operations/status.dto';
import { OperationProcessor } from './processors/operation.processor';
import { Payment } from '@commercetools/platform-sdk';

export class DefaultOperationService implements OperationService {
  private ctPaymentService: CommercetoolsPaymentService;
  private operationProcessor: OperationProcessor;

  constructor(opts: OperationServiceOptions) {
    this.ctPaymentService = opts.ctPaymentService;
    this.operationProcessor = opts.operationProcessor;
  }

  public async getStatus(): Promise<StatusResponseSchemaDTO> {
    return this.operationProcessor.status();
  }

  public async getConfig(): Promise<ConfigResponseSchemaDTO> {
    return this.operationProcessor.config();
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

  public async modifyPayment(opts: ModifyPayment): Promise<PaymentIntentResponseSchemaDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });
    const request = opts.data.actions[0];

    let requestAmount!: AmountSchemaDTO;
    if (request.action != 'cancelPayment') {
      requestAmount = request.amount;
    } else {
      requestAmount = ctPayment.amountPlanned;
    }

    const transactionType = this.getPaymentTransactionType(request.action);
    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: transactionType,
        amount: requestAmount,
        state: 'Initial',
      },
    });
    const res = await this.processPaymentModification(updatedPayment, transactionType, requestAmount);

    await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      transaction: {
        type: transactionType,
        amount: requestAmount,
        interactionId: res?.pspReference,
        state: res.outcome === PaymentModificationStatus.APPROVED ? 'Success' : 'Failure',
      },
    });

    return {
      outcome: res.outcome,
    };
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
      default: {
        throw new ErrorInvalidJsonInput(`Request body does not contain valid JSON.`);
      }
    }
  }

  private async processPaymentModification(payment: Payment, transactionType: string, requestAmount: AmountSchemaDTO) {
    switch (transactionType) {
      case 'CancelAuthorization': {
        return await this.operationProcessor.cancelPayment({ payment });
      }
      case 'Charge': {
        return await this.operationProcessor.capturePayment({ amount: requestAmount, payment });
      }
      case 'Refund': {
        return await this.operationProcessor.refundPayment({ amount: requestAmount, payment });
      }
      default: {
        throw new ErrorInvalidOperation(`Operation ${transactionType} not supported.`);
      }
    }
  }
}

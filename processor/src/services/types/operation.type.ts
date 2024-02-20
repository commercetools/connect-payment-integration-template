import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { PaymentOutcome, PaymentRequestSchemaDTO } from '../../dtos/mock-payment.dto';
import { ConfigResponseSchemaDTO } from '../../dtos/operations/config.dto';
import { SupportedPaymentComponentsSchemaDTO } from '../../dtos/operations/payment-componets.dto';
import {
  AmountSchemaDTO,
  PaymentIntentRequestSchemaDTO,
  PaymentIntentResponseSchemaDTO,
  PaymentModificationStatus,
} from '../../dtos/operations/payment-intents.dto';
import { StatusResponseSchemaDTO } from '../../dtos/operations/status.dto';
import { OperationProcessor } from '../processors/operation.processor';
import { Payment } from '@commercetools/platform-sdk';

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
};

export type CapturePaymentRequest = {
  amount: AmountSchemaDTO;
  payment: Payment;
};

export type CancelPaymentRequest = {
  payment: Payment;
};

export type RefundPaymentRequest = {
  amount: AmountSchemaDTO;
  payment: Payment;
};

export type PaymentProviderResponse = {
  resultCode: PaymentOutcome;
  pspReference: string;
  paymentMethodType: string;
};

export type PaymentProviderModificationResponse = {
  outcome: PaymentModificationStatus;
  pspReference: string;
};

export type ConfigResponse = ConfigResponseSchemaDTO;

export type StatusResponse = StatusResponseSchemaDTO;

export type ModifyPayment = {
  paymentId: string;
  data: PaymentIntentRequestSchemaDTO;
};

export interface OperationService {
  getStatus(): Promise<StatusResponseSchemaDTO>;
  getConfig(): Promise<ConfigResponseSchemaDTO>;
  getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO>;
  modifyPayment(opts: ModifyPayment): Promise<PaymentIntentResponseSchemaDTO>;
}

export type OperationServiceOptions = {
  operationProcessor: OperationProcessor;
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

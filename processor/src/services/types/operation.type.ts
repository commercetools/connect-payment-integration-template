import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { ConfigResponseSchemaDTO } from '../../dtos/config.dto';
import { PaymentOutcome, PaymentRequestSchemaDTO } from '../../dtos/mock-payment.dto';
import { SupportedPaymentComponentsSchemaDTO } from '../../dtos/payment-componets.dto';
import {
  AmountSchemaDTO,
  PaymentIntentRequestSchemaDTO,
  PaymentIntentResponseSchemaDTO,
  PaymentModificationStatus,
} from '../../dtos/payment-intents.dto';
import { StatusResponseSchemaDTO } from '../../dtos/status.dto';
import { OperationProcessor } from '../processors/operation.processor';

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
};

export type CapturePaymentRequest = {
  amount: AmountSchemaDTO;
  pspReference: string;
};

export type CancelPaymentRequest = {
  pspReference: string;
};

export type RefundPaymentRequest = {
  amount: AmountSchemaDTO;
  pspReference: string;
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

export type ConfigResponse = {
  [key: string]: any;
};

export type StatusResponse = StatusResponseSchemaDTO;

export type ModifyPayment = {
  paymentId: string;
  data: PaymentIntentRequestSchemaDTO;
};

export interface OperationService {
  getStatus(): Promise<StatusResponseSchemaDTO>
  getConfig(): Promise<ConfigResponseSchemaDTO>;
  getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO>;
  modifyPayment(opts: ModifyPayment): Promise<PaymentIntentResponseSchemaDTO>;
}

export type OperationServiceOptions = {
  operationProcessor: OperationProcessor
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

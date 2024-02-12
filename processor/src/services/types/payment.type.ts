import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  PaymentIntentUpdateDTO,
  PaymentIntentUpdateResponseDTO,
  PaymentModificationStatus,
  PaymentOutcome,
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO,
} from '../../dtos/payment.dto';


export type CreatePayment = {
  data: PaymentRequestSchemaDTO;
};

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
};

export type RequestAmount = {
  amount: number;
  currency: string;
};

export type CapturePaymentRequest = {
  amount: RequestAmount;
  pspReference: string;
};

export type CancelPaymentRequest = {
  pspReference: string;
};

export type RefundPaymentRequest = {
  amount: {
    amount: number,
    currency: string;
  };
  pspReference: string;
};

export type MockPaymentProviderResponse = {
  resultCode: PaymentOutcome;
  pspReference: string;
  paymentMethodType: string;
};

export type MockPaymentProviderModificationResponse = {
  outcome: PaymentModificationStatus;
  pspReference: string;
};

export type ModifyPayment = {
  paymentId: string;
  data: PaymentIntentUpdateDTO;
};

export interface PaymentService {
  createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO>;
  getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO>;
  modifyPayment(opts: ModifyPayment): Promise<PaymentIntentUpdateResponseDTO>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

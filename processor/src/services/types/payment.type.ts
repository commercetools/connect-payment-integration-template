import { Cart, Payment } from '@commercetools/platform-sdk';
import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  CapturePaymentRequestDTO,
  PaymentModificationResponseDTO,
  PaymentModificationStatus,
  PaymentOutcome,
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO,
  RefundPaymentRequestDTO
} from '../../dtos/payment.dto';

export type CreatePayment = {
  data: PaymentRequestSchemaDTO;
};

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
  cart: Cart;
  payment: Payment;
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

export type CancelPayment = {
  paymentId: string;
};

export type CapturePayment = {
  paymentId: string;
  data: CapturePaymentRequestDTO;
};

export type RefundPayment = {
  paymentId: string;
  data: RefundPaymentRequestDTO;
};

export interface PaymentService {
  createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO>;
  cancelPayment(opts: CancelPayment): Promise<PaymentModificationResponseDTO>;
  capturePayment(opts: CapturePayment): Promise<PaymentModificationResponseDTO>;
  refundPayment(opts: RefundPayment): Promise<PaymentModificationResponseDTO>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

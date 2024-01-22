import { Cart, Payment } from '@commercetools/platform-sdk';
import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  CapturePaymentRequestDTO,
  ConfirmPaymentData,
  CreatePaymentData,
  CreateSessionData,
  GetPaymentMethodsData,
  PaymentConfirmationData,
  PaymentData,
  PaymentMethodsData,
  PaymentModificationResponseDTO,
  RefundPaymentRequestDTO,
  SessionData,
} from '../../dtos/payment.dto';
import { PaymentMethodsResponse } from '@adyen/api-library/lib/src/typings/checkout/paymentMethodsResponse';

export type GetPaymentMethods = {
  data: GetPaymentMethodsData;
};

export type ConvertGetPaymentMethods = {
  data: GetPaymentMethodsData;
  cartId: string;
};

export type CreateSession = {
  data: CreateSessionData;
};

export type ConvertCreateSession = {
  data: CreateSessionData;
  cart: Cart;
  payment: Payment;
};

export type CreatePayment = {
  data: CreatePaymentData;
};

export type ConvertCreatePayment = {
  data: CreatePaymentData;
  cart: Cart;
  payment: Payment;
};

export type ConfirmPayment = {
  data: ConfirmPaymentData;
};

export type ConvertConfirmPayment = {
  data: ConfirmPaymentData;
};

export type CancelPayment = {
  paymentId: string;
};

export type ConvertCancelPayment = {
  payment: Payment;
};

export type CapturePayment = {
  paymentId: string;
  data: CapturePaymentRequestDTO;
};

export type ConvertCapturePayment = {
  payment: Payment;
  data: CapturePaymentRequestDTO;
};

export type RefundPayment = {
  paymentId: string;
  data: RefundPaymentRequestDTO;
};

export type ConvertRefundPayment = {
  payment: Payment;
  data: RefundPaymentRequestDTO;
};

export type ConvertPaymentMethodsResponse = {
  data: PaymentMethodsResponse;
};

export interface PaymentService {
  getPaymentMethods(opts: GetPaymentMethods): Promise<PaymentMethodsData>;
  createSession(opts: CreateSession): Promise<SessionData>;
  createPayment(opts: CreatePayment): Promise<PaymentData>;
  confirmPayment(opts: ConfirmPayment): Promise<PaymentConfirmationData>;
  cancelPayment(opts: CancelPayment): Promise<PaymentModificationResponseDTO>;
  capturePayment(opts: CapturePayment): Promise<PaymentModificationResponseDTO>;
  refundPayment(opts: RefundPayment): Promise<PaymentModificationResponseDTO>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

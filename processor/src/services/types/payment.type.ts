import { Cart, Payment } from '@commercetools/platform-sdk';
import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  PaymentOutcome,
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO
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
  resultCode: PaymentOutcome,
  pspReference: string,
  paymentMethodType: string,
};

export interface PaymentService {
  createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

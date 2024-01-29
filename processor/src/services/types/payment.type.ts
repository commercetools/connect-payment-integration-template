import { Cart, Payment } from '@commercetools/platform-sdk';
import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {PaymentRequestSchemaDTO, PaymentResponseSchemaDTO} from '../../dtos/payment.dto';
import { PaymentMethodsResponse } from '@adyen/api-library/lib/src/typings/checkout/paymentMethodsResponse';

export type CreatePayment = {
  data: PaymentRequestSchemaDTO;
};

export type ConvertCreatePayment = {
  data: PaymentRequestSchemaDTO;
  cart: Cart;
  payment: Payment;
};

export type ConvertPaymentMethodsResponse = {
  data: PaymentMethodsResponse;
};

export interface PaymentService {
  createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

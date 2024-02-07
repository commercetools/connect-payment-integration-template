import { Cart, Payment } from '@commercetools/platform-sdk';
import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { PaymentOutcome, PaymentRequestSchemaDTO, PaymentResponseSchemaDTO } from '../../dtos/payment.dto';
import { SupportedPaymentMethodsDTO } from '../../dtos/payment-methods.dto';

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

export type SupportedPaymentComponents = {
  supportedPaymentComponents: SupportedPaymentMethodsDTO;
};

export interface PaymentService {
  createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO>;
  getSupportedPaymentComponents(): Promise<SupportedPaymentComponents>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

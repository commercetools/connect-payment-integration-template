import { PaymentOutcome, PaymentRequestSchemaDTO } from '../../dtos/mock-payment.dto';

export type CreatePayment = {
  data: PaymentRequestSchemaDTO;
};

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
};

export type MockPaymentProviderResponse = {
  resultCode: PaymentOutcome;
  pspReference: string;
  paymentMethodType: string;
};

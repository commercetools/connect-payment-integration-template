import { PaymentRequestSchemaDTO } from '../../dtos/mock-payment.dto';
import {
  CommercetoolsCartService,
  CommercetoolsPaymentMethodService,
  CommercetoolsPaymentService,
} from '@commercetools/connect-payments-sdk';

export type MockPaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctPaymentMethodService: CommercetoolsPaymentMethodService;
};

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
};

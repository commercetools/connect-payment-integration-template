import { PaymentRequestSchemaDTO } from '../../dtos/mock-payment.dto';
import {
  CommercetoolsCartService,
  CommercetoolsPaymentMethodService,
  CommercetoolsPaymentService,
  CommercetoolsRecurringPaymentJobService,
} from '@commercetools/connect-payments-sdk';

export type MockPaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctPaymentMethodService: CommercetoolsPaymentMethodService;
  ctRecurringPaymentJobService: CommercetoolsRecurringPaymentJobService;
};

export type CreatePaymentRequest = {
  data: PaymentRequestSchemaDTO;
};

import { PaymentRequestSchemaDTO } from '../../dtos/mock-payment.dto';
import {CommercetoolsCartService, CommercetoolsPaymentService} from "@commercetools/connect-payments-sdk";

export type MockPaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

export type CreatePayment = {
  data: PaymentRequestSchemaDTO;
};

export type MockPaymentRefundRequest = {
  merchantAccount: string,
  reference: request.payment.id,
  amount: {
    currency: request.amount.currencyCode,
    value: request.amount.centAmount,
  },
};

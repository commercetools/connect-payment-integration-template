import { Cart, Payment } from '@commercetools/platform-sdk';
import { CommercetoolsCartService, CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import {
  PaymentModificationRequestSchemaDTO,
  PaymentModificationResponseDTO,
  PaymentModificationStatus,
  PaymentOutcome,
  PaymentRequestSchemaDTO,
  PaymentResponseSchemaDTO,
} from '../../dtos/payment.dto';
import {MockPaymentConnector} from "../../clients/mockPaymentConnector";

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

export type ModifyPayment = {
  paymentId: string;
  data: PaymentModificationRequestSchemaDTO;
};

export interface PaymentService {
  createPayment(opts: CreatePayment): Promise<PaymentResponseSchemaDTO>;
  modifyPayment(opts: ModifyPayment): Promise<PaymentModificationResponseDTO>;
}

export type PaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
};

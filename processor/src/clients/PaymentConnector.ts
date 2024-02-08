import {
  CreatePaymentRequest,
  MockPaymentProviderModificationResponse,
  MockPaymentProviderResponse
} from '../services/types/payment.type';
import { Payment } from '@commercetools/platform-sdk';

export interface PaymentConnector {

  processPayment: (request: CreatePaymentRequest) => Promise<MockPaymentProviderResponse>
  modifyPaymentByPspReference: (pspReference: string, payment: Payment) => Promise<MockPaymentProviderModificationResponse>
}

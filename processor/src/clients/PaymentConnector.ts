import {
  CreatePaymentRequest,
  MockPaymentProviderModificationResponse,
  MockPaymentProviderResponse
} from '../services/types/payment.type';
import { Payment } from '@commercetools/platform-sdk';

export interface PaymentConnector {

  processPayment: (request: CreatePaymentRequest) => Promise<MockPaymentProviderResponse>
  capturePayment: (pspReference: string, payment: Payment) => Promise<MockPaymentProviderModificationResponse>
  cancelPayment: (pspReference: string, payment: Payment) => Promise<MockPaymentProviderModificationResponse>
  refundPayment: (pspReference: string, payment: Payment) => Promise<MockPaymentProviderModificationResponse>
}

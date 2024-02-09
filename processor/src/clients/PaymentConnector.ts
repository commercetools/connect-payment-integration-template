import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  CreatePaymentRequest,
  MockPaymentProviderModificationResponse,
  MockPaymentProviderResponse, RefundPaymentRequest
} from '../services/types/payment.type';

export interface PaymentConnector {

  processPayment: (request: CreatePaymentRequest) => Promise<MockPaymentProviderResponse>
  capturePayment: (request: CapturePaymentRequest) => Promise<MockPaymentProviderModificationResponse>
  cancelPayment: (request: CancelPaymentRequest) => Promise<MockPaymentProviderModificationResponse>
  refundPayment: (request: RefundPaymentRequest) => Promise<MockPaymentProviderModificationResponse>
}

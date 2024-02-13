import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  ConfigResponse,
  PaymentProviderModificationResponse,
  RefundPaymentRequest,
  StatusResponse,
} from '../types/operation.type';

export interface OperationProcessor {
  /**
   * Get configuration information
   * @returns
   */
  config: () => Promise<ConfigResponse>;

  /**
   * Get stats information
   * @returns
   */
  status: () => Promise<StatusResponse>;

  /**
   * Capture payment
   * @param request
   * @returns
   */
  capturePayment: (request: CapturePaymentRequest) => Promise<PaymentProviderModificationResponse>;

  /**
   * Cancel payment
   * @param request
   * @returns
   */
  cancelPayment: (request: CancelPaymentRequest) => Promise<PaymentProviderModificationResponse>;

  /**
   * Refund payment
   * @param request
   * @returns
   */
  refundPayment: (request: RefundPaymentRequest) => Promise<PaymentProviderModificationResponse>;
}

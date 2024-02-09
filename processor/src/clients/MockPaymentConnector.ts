import { v4 as uuid } from 'uuid';
import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  CreatePaymentRequest, MockPaymentProviderModificationResponse,
  MockPaymentProviderResponse, RefundPaymentRequest
} from '../services/types/payment.type';
import { PaymentModificationStatus, PaymentOutcome } from '../dtos/payment.dto';
import {PaymentConnector} from "./PaymentConnector";

export class MockPaymentConnector implements PaymentConnector {

  private allowedCreditCards = ['4111111111111111', '5555555555554444', '341925950237632'];

  /**
   * @param request
   * @returns
   */
  async processPayment(request: CreatePaymentRequest): Promise<MockPaymentProviderResponse> {
    const paymentMethod = request.data.paymentMethod;
    const isAuthorized = this.isCreditCardAllowed(paymentMethod.cardNumber);

    return {
      resultCode: isAuthorized ? PaymentOutcome.AUTHORIZED : PaymentOutcome.REJECTED,
      pspReference: uuid(),
      paymentMethodType: paymentMethod.type,
    };
  }

  async capturePayment(request: CapturePaymentRequest): Promise<MockPaymentProviderModificationResponse> {

    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.pspReference }
  }

  async cancelPayment(request: CancelPaymentRequest): Promise<MockPaymentProviderModificationResponse> {

    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.pspReference }
  }

  async refundPayment(request: RefundPaymentRequest): Promise<MockPaymentProviderModificationResponse> {

    return { outcome: PaymentModificationStatus.APPROVED, pspReference: request.pspReference }
  }

  isCreditCardAllowed(cardNumber: string) {
    return this.allowedCreditCards.includes(cardNumber);
  }
}

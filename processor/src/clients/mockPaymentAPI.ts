import { v4 as uuid } from 'uuid';
import {
  CreatePaymentRequest, MockPaymentProviderModificationResponse,
  MockPaymentProviderResponse
} from '../services/types/payment.type';
import { PaymentModificationStatus, PaymentOutcome } from '../dtos/payment.dto';
import { Payment } from '@commercetools/platform-sdk';

// TODO: Make it class , add interface and provide implementation
export const paymentProviderApi = (): any => {
  const allowedCreditCards = ['4111111111111111', '5555555555554444', '341925950237632'];
  /**
   * @param request
   * @returns
   */
  const processPayment = async (request: CreatePaymentRequest): Promise<MockPaymentProviderResponse> => {
    const paymentMethod = request.data.paymentMethod;
    const isAuthorized = isCreditCardAllowed(paymentMethod.cardNumber);

    return {
      resultCode: isAuthorized ? PaymentOutcome.AUTHORIZED : PaymentOutcome.REJECTED,
      pspReference: uuid(),
      paymentMethodType: paymentMethod.type,
    };
  };

  const cancelAuthorisedPaymentByPspReference =
      async (pspReference: string, payment: Payment): Promise<MockPaymentProviderModificationResponse> => {

    return { outcome: PaymentModificationStatus.RECEIVED, pspReference: pspReference }
  }

  const captureAuthorisedPayment =
      async (pspReference: string, payment: Payment): Promise<MockPaymentProviderModificationResponse> => {

    return { outcome: PaymentModificationStatus.RECEIVED, pspReference: pspReference }
  }

  const refundCapturedPayment =
      async (pspReference: string, payment: Payment): Promise<MockPaymentProviderModificationResponse> => {

    return { outcome: PaymentModificationStatus.RECEIVED, pspReference: pspReference }
  }

  const isCreditCardAllowed = (cardNumber: string) => allowedCreditCards.includes(cardNumber);

  return {
    processPayment,
    cancelAuthorisedPaymentByPspReference,
    captureAuthorisedPayment,
    refundCapturedPayment,
  };
};

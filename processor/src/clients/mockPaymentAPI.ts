import { v4 as uuid } from 'uuid';
import {CreatePaymentRequest, MockPaymentProviderResponse} from '../services/types/payment.type';
import {PaymentOutcome} from "../dtos/payment.dto";

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
            resultCode: isAuthorized ? PaymentOutcome.AUTHORIZED: PaymentOutcome.REJECTED,
            pspReference: uuid(),
            paymentMethodType: paymentMethod.type,
        }
    };

    const isCreditCardAllowed = (cardNumber: string) => allowedCreditCards.includes(cardNumber);

    return {
        processPayment
    };

};

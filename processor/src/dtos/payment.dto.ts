import { Static, Type } from '@sinclair/typebox';
import { CreateCheckoutSessionRequest } from '@adyen/api-library/lib/src/typings/checkout/createCheckoutSessionRequest';
import { CreateCheckoutSessionResponse } from '@adyen/api-library/lib/src/typings/checkout/createCheckoutSessionResponse';
import { PaymentDetailsRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentDetailsRequest';
import { PaymentDetailsResponse } from '@adyen/api-library/lib/src/typings/checkout/paymentDetailsResponse';
import { PaymentMethodsRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentMethodsRequest';
import { PaymentMethodsResponse } from '@adyen/api-library/lib/src/typings/checkout/paymentMethodsResponse';
import { PaymentRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentRequest';
import { PaymentResponse } from '@adyen/api-library/lib/src/typings/checkout/paymentResponse';

export type GetPaymentMethodsData = Omit<PaymentMethodsRequest, 'amount' | 'merchantAccount' | 'countryCode'>;
export type PaymentMethodsData = PaymentMethodsResponse;

export type CreateSessionData = Omit<
  CreateCheckoutSessionRequest,
  | 'amount'
  | 'merchantAccount'
  | 'countryCode'
  | 'returnUrl'
  | 'reference'
  | 'storePaymentMethod'
  | 'shopperReference'
  | 'recurringProcessingModel'
  | 'storePaymentMethodMode'
>;

export type SessionData = {
  sessionData: CreateCheckoutSessionResponse;
  paymentReference: string;
};

export type CreatePaymentData = Omit<
  PaymentRequest,
  | 'amount'
  | 'additionalAmount'
  | 'merchantAccount'
  | 'countryCode'
  | 'returnUrl'
  | 'lineItems'
  | 'reference'
  | 'shopperReference'
  | 'recurringProcessingModel'
> & {
  paymentReference?: string;
};
export type PaymentData = Pick<
  PaymentResponse,
  'action' | 'resultCode' | 'threeDS2ResponseData' | 'threeDS2Result' | 'threeDSPaymentData'
> & {
  paymentReference: string;
};

export type PaymentConfirmationData = Pick<
  PaymentDetailsResponse,
  'resultCode' | 'threeDS2ResponseData' | 'threeDS2Result' | 'threeDSPaymentData'
> & {
  paymentReference: string;
};

export type ConfirmPaymentData = PaymentDetailsRequest & {
  paymentReference: string;
};

export const CapturePaymentRequestSchema = Type.Object({
  amount: Type.Object({
    centAmount: Type.Number(),
    currencyCode: Type.String(),
  }),
});

export const RefundPaymentRequestSchema = Type.Object({
  amount: Type.Object({
    centAmount: Type.Number(),
    currencyCode: Type.String(),
  }),
});

export enum PaymentModificationStatus {
  RECEIVED = 'received',
}
const PaymentModificationSchema = Type.Enum(PaymentModificationStatus);

export const PaymentModificationResponseSchema = Type.Object({
  status: PaymentModificationSchema,
});

export type DeleteStoredPaymentMethodData = {
  customerId: string;
};

export type CapturePaymentRequestDTO = Static<typeof CapturePaymentRequestSchema>;
export type RefundPaymentRequestDTO = Static<typeof RefundPaymentRequestSchema>;
export type PaymentModificationResponseDTO = Static<typeof PaymentModificationResponseSchema>;

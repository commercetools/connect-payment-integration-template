import {Static, Type} from '@sinclair/typebox';

// TODO: Identify the SessionRequest Type for mock payment

// export type CreateSessionData = Omit<
//     CreateCheckoutSessionRequest,
//     | 'amount'
//     | 'merchantAccount'
//     | 'countryCode'
//     | 'returnUrl'
//     | 'reference'
//     | 'storePaymentMethod'
//     | 'shopperReference'
//     | 'recurringProcessingModel'
//     | 'storePaymentMethodMode'
// >;
//
// export type SessionData = {
//   sessionData: CreateCheckoutSessionResponse;
//   paymentReference: string;
// };

export const cartPaymentMethod = Type.Object({
  type: Type.Literal('card'),
  number: Type.String(),
  expiryMonth: Type.Number(),
  expiryYear: Type.Number(),
  cvc: Type.Number(),
  holderName: Type.Optional(Type.String())
});

export const PaymentRequestSchema = Type.Object({
  paymentMethod: Type.Composite([cartPaymentMethod]),
  paymentReference: Type.String(),
});

export enum paymentOutcome {
  AUTHORIZED = 'Authorized',
  REJECTED = 'Rejected',
}

export const paymentOutcomeSchema = Type.Enum(paymentOutcome);

export const PaymentResponseSchema = Type.Object({
  outcome: paymentOutcomeSchema,
  paymentReference: Type.String(),
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
export type PaymentResponseSchemaDTO = Static<typeof PaymentResponseSchema>;


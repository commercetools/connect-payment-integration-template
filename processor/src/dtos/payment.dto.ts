import { Static, Type } from '@sinclair/typebox';

export const CardPaymentMethod = Type.Object({
  // TODO: Remove the fields according to the payment provider solution,
  //  Strongly recommend not to process PAN data to Connectors.
  type: Type.Literal('card'),
  cardNumber: Type.String(),
  expiryMonth: Type.Number(),
  expiryYear: Type.Number(),
  cvc: Type.Number(),
  holderName: Type.Optional(Type.String()),
});

export const PaymentRequestSchema = Type.Object({
  paymentMethod: Type.Composite([CardPaymentMethod]),
  paymentReference: Type.String(),
});

export enum PaymentOutcome {
  AUTHORIZED = 'Authorized',
  REJECTED = 'Rejected',
}

export const PaymentOutcomeSchema = Type.Enum(PaymentOutcome);

export const PaymentResponseSchema = Type.Object({
  outcome: PaymentOutcomeSchema,
  paymentReference: Type.String(),
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
export type PaymentResponseSchemaDTO = Static<typeof PaymentResponseSchema>;
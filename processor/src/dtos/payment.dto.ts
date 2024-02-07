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

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
export type PaymentResponseSchemaDTO = Static<typeof PaymentResponseSchema>;
export type CapturePaymentRequestDTO = Static<typeof CapturePaymentRequestSchema>;
export type RefundPaymentRequestDTO = Static<typeof RefundPaymentRequestSchema>;
export type PaymentModificationResponseDTO = Static<typeof PaymentModificationResponseSchema>;

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


export const Amount = Type.Object({
  amount: Type.Integer(),
  currency: Type.String(),
});

export const ActionCapturePayment = Type.Composite([
  Type.Object({
    action: Type.Literal('capturePayment'),
  }),
  Type.Object({
    amount: Amount,
  }),
]);

export const ActionRefundPayment = Type.Composite([
  Type.Object({
    action: Type.Literal('refundPayment'),
  }),
  Type.Object({
    amount: Amount,
  }),
]);

export const ActionCancelPayment = Type.Composite([
  Type.Object({
    action: Type.Literal('cancelPayment'),
  }),
]);

export const PaymentIntentUpdate = Type.Object({
  actions: Type.Array(Type.Union([ActionCapturePayment, ActionRefundPayment, ActionCancelPayment]), { maxItems: 1 }),
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

export enum PaymentModificationStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
const PaymentModificationSchema = Type.Enum(PaymentModificationStatus);

export const PaymentIntentUpdateResponse = Type.Object({
  outcome: PaymentModificationSchema,
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
export type PaymentIntentUpdateDTO = Static<typeof PaymentIntentUpdate>;
export type PaymentResponseSchemaDTO = Static<typeof PaymentResponseSchema>;
export type PaymentIntentUpdateResponseDTO = Static<typeof PaymentIntentUpdateResponse>;

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

export const PaymentModificationRequestSchema = Type.Object({
  action: Type.String(),
  amount: Type.Object({
    centAmount: Type.Number(),
    currencyCode: Type.String(),
  })
})

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
  SUCCESS = 'success',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
const PaymentModificationSchema = Type.Enum(PaymentModificationStatus);

export const PaymentModificationResponseSchema = Type.Object({
  outcome: PaymentModificationSchema,
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
export type PaymentModificationRequestSchemaDTO = Static<typeof PaymentModificationRequestSchema>;
export type PaymentResponseSchemaDTO = Static<typeof PaymentResponseSchema>;
export type PaymentModificationResponseDTO = Static<typeof PaymentModificationResponseSchema>;

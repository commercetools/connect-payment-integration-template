import { Static, Type } from "@sinclair/typebox";

export enum PaymentOutcome {
  AUTHORIZED = "Authorized",
  REJECTED = "Rejected",
}

export const PaymentOutcomeSchema = Type.Enum(PaymentOutcome);

export const PaymentRequestSchema = Type.Object({
  paymentMethod: Type.Object({
    type: Type.String(),
    poNumber: Type.Optional(Type.String()),
    invoiceMemo: Type.Optional(Type.String()),
    storedPaymentMethodId: Type.Optional(Type.String()),
    storePaymentMethod: Type.Optional(Type.Boolean()),
  }),
  paymentOutcome: PaymentOutcomeSchema,
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;

import { Static, Type } from '@sinclair/typebox';

export enum PaymentOutcome {
  AUTHORIZED = 'Authorized',
  REJECTED = 'Rejected',
}

export enum PaymentMethodType {
  CARD = 'card',
  CUSTOM_TEST_METHOD = 'customtestmethod',
  INVOICE = 'invoice',
  PURCHASE_ORDER = 'purchaseorder',
}

export const PaymentResponseSchema = Type.Object({
  paymentReference: Type.String(),
});

export const PaymentOutcomeSchema = Type.Enum(PaymentOutcome);

export const PaymentRequestSchema = Type.Object({
  paymentMethod: Type.Object({
    type: Type.Enum(PaymentMethodType),
    poNumber: Type.Optional(Type.String()),
    invoiceMemo: Type.Optional(Type.String()),
    storedPaymentMethodId: Type.Optional(
      Type.String({ description: 'The ID of the stored-payment-method used to pay with.' }),
    ),
    storePaymentMethod: Type.Optional(
      Type.Boolean({
        description: 'True if the user has given consent to storing/tokenising the payment method.',
      }),
    ),
  }),
  paymentOutcome: PaymentOutcomeSchema,
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
export type PaymentResponseSchemaDTO = Static<typeof PaymentResponseSchema>;

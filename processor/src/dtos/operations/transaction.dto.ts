import { Static, Type } from '@sinclair/typebox';

export const TransactionDraft = Type.Object({
  cartId: Type.String({ format: 'uuid' }),
  paymentInterface: Type.String({ format: 'uuid' }),
  amount: Type.Optional(
    Type.Object({
      centAmount: Type.Number(),
      currencyCode: Type.String(),
    }),
  ),
});
export const TransactionStatusState = Type.Union([Type.Literal('Pending'), Type.Literal('Failed')]);

export const TransactionResponse = Type.Object({
  transactionStatus: Type.Object({
    state: TransactionStatusState,
    errors: Type.Array(
      Type.Object({
        code: Type.Literal('PaymentRejected'),
        message: Type.String(),
      }),
    ),
  }),
});

export type TransactionDraftSchemaDTO = Static<typeof TransactionDraft>;
export type TransactionResponseSchemaDTO = Static<typeof TransactionResponse>;

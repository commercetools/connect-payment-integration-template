import { Static, Type } from '@sinclair/typebox';

export const StoredPaymentMethodSchema = Type.Object({
  id: Type.String(),
  type: Type.String(),
  token: Type.String(),
  isDefault: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  displayOptions: Type.Object({
    endDigits: Type.Optional(Type.String()),
    brand: Type.Optional(
      Type.Object({
        key: Type.String(),
      }),
    ),
    expiryMonth: Type.Optional(Type.Number()),
    expiryYear: Type.Optional(Type.Number()),
    logoUrl: Type.Optional(Type.String()),
  }),
});

export const StoredPaymentMethodsResponseSchema = Type.Object({
  storedPaymentMethods: Type.Array(StoredPaymentMethodSchema),
});

export type StoredPaymentMethod = Static<typeof StoredPaymentMethodSchema>;
export type StoredPaymentMethodsResponse = Static<typeof StoredPaymentMethodsResponseSchema>;

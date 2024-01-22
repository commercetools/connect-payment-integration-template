import { Static, Type } from '@sinclair/typebox';

export const SupportedPaymentMethodDTO = Type.Object({
  type: Type.String(),
});

export const SupportedPaymentMethodsSchema = Type.Object({
  dropin: Type.Optional(Type.Array(SupportedPaymentMethodDTO)),
  components: Type.Optional(Type.Array(SupportedPaymentMethodDTO)),
  hostedPage: Type.Optional(Type.Array(SupportedPaymentMethodDTO)),
});

export type SupportedPaymentMethodsDTO = Static<typeof SupportedPaymentMethodsSchema>;

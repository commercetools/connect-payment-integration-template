import { Static, Type } from '@sinclair/typebox';

export const SupportedPaymentComponentsData = Type.Object({
  type: Type.String(),
});

export const SupportedPaymentComponentsSchema = Type.Object({
  components: Type.Array(SupportedPaymentComponentsData),
});

export type SupportedPaymentComponentsSchemaDTO = Static<typeof SupportedPaymentComponentsSchema>;

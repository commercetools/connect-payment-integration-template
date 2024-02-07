import { Static, Type } from '@sinclair/typebox';

export const SupportedPaymentMethodData = Type.String();

export const SupportedPaymentMethodsSchema = Type.Array(SupportedPaymentMethodData);

export type SupportedPaymentMethodsDTO = Static<typeof SupportedPaymentMethodsSchema>;

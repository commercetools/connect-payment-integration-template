import { Static, Type } from '@sinclair/typebox';

/**
 * Public shareable payment provider configuration. Do not include any sensitive data.
 */
export const ConfigResponseSchema = Type.Any();

export type ConfigResponseSchemaDTO = Static<typeof ConfigResponseSchema>;

import { Static, Type } from '@sinclair/typebox';

export const ConfigResponseSchema = Type.Any();

export type ConfigResponseSchemaDTO = Static<typeof ConfigResponseSchema>;

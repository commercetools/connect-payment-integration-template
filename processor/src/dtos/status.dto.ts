import { Static, Type } from '@sinclair/typebox';

export const StatusResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  version: Type.String(),
  metadata: Type.Optional(Type.Any()),
  checks: Type.Array(
    Type.Object({
      name: Type.String(),
      status: Type.String(),
      details: Type.Optional(Type.Any()),
    }),
  ),
});

export type StatusResponseSchemaDTO = Static<typeof StatusResponseSchema>;

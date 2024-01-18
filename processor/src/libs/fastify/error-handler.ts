import { type FastifyReply, type FastifyRequest } from 'fastify';

import { ErrorInvalidField, ErrorRequiredField, Errorx, MultiErrorx } from '@commercetools/connect-payments-sdk';
import { log } from '../logger';

const getKeys = (path: string) => path.replace(/^\//, '').split('/');

const getPropertyFromPath = (path: string, obj: any): any => {
  const keys = getKeys(path);
  let value = obj;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

type ValidationObject = {
  validation: object;
};

type TError = {
  statusCode: number;
  code: string;
  message: string;
  errors?: object[];
};

export const errorHandler = (error: Error, req: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof Object && (error as unknown as ValidationObject).validation) {
    const errorsList: Errorx[] = [];

    // Transforming the validation errors
    for (const err of (error as any).validation) {
      switch (err.keyword) {
        case 'required':
          errorsList.push(new ErrorRequiredField(err.params.missingProperty));
          break;
        case 'enum':
          errorsList.push(
            new ErrorInvalidField(
              getKeys(err.instancePath).join('.'),
              getPropertyFromPath(err.instancePath, req.body),
              err.params.allowedValues,
            ),
          );
      }

      if (errorsList.length > 1) {
        error = new MultiErrorx(errorsList);
      } else {
        error = errorsList[0];
      }
    }
  }

  if (error instanceof Errorx) {
    return handleErrorx(error, reply);
  } else {
    const { message, ...meta } = error;
    log.error(message, meta);
    return reply.code(500).send({
      code: 'General',
      message: 'Internal server error.',
      statusCode: 500,
    });
  }
};

const handleErrorx = (error: Errorx, reply: FastifyReply) => {
  const { message, ...meta } = error;
  log.error(message, meta);
  const errorBuilder: TError = {
    statusCode: error.httpErrorStatus,
    code: error.code,
    message: error.message,
  };

  const errors: object[] = [];
  if (error.fields) {
    errors.push({
      code: error.code,
      message: error.message,
      ...error.fields,
    });
  }

  if (errors.length > 0) {
    errorBuilder.errors = errors;
  }

  return reply.code(error.httpErrorStatus).send(errorBuilder);
};

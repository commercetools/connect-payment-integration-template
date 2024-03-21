import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import Fastify, { type FastifyInstance, FastifyError } from 'fastify';
import { errorHandler } from '../../../src/libs/fastify/error-handler';
import { ErrorAuthErrorResponse, Errorx, ErrorxAdditionalOpts } from '@commercetools/connect-payments-sdk';
import { requestContextPlugin } from '../../../src/libs/fastify/context/context';
import { FastifySchemaValidationError } from 'fastify/types/schema';

describe('error-handler', () => {
  let fastify: FastifyInstance;
  beforeEach(async () => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
    await fastify.register(requestContextPlugin);
  });

  afterEach(async () => {
    await fastify.close();
  });

  test('errox error', async () => {
    fastify.get('/', () => {
      throw new Errorx({
        code: 'ErrorCode',
        message: 'someMessage',
        httpErrorStatus: 404,
      });
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toStrictEqual({
      message: 'someMessage',
      statusCode: 404,
      errors: [
        {
          code: 'ErrorCode',
          message: 'someMessage',
        },
      ],
    });
  });

  test('errox with fields', async () => {
    fastify.get('/', () => {
      throw new Errorx({
        code: 'ErrorCode',
        message: 'someMessage',
        httpErrorStatus: 404,
        fields: {
          test: 'field1',
        },
      });
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toStrictEqual({
      message: 'someMessage',
      statusCode: 404,
      errors: [
        {
          code: 'ErrorCode',
          message: 'someMessage',
          test: 'field1',
        },
      ],
    });
  });

  test('general error', async () => {
    fastify.get('/', () => {
      throw new Error('some message goes here');
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toStrictEqual({
      message: 'Internal server error.',
      statusCode: 500,
      errors: [
        {
          code: 'General',
          message: 'Internal server error.',
        },
      ],
    });
  });

  test('Fastify error with missing required field', async () => {
    const validationError: FastifySchemaValidationError = {
      keyword: 'required',
      instancePath: 'instancePath/domain/value',
      schemaPath: 'schemaPath/domain/value',
      params: {
        missingProperty: 'dummy-field',
      },
      message: 'fastify-error-message',
    };
    const fastifyError: FastifyError = {
      code: 'ErrorCode',
      name: 'fastify-error',
      message: 'fastify-error-message',
      validation: [validationError],
    };
    fastify.get('/', () => {
      throw fastifyError;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.json()).toStrictEqual({
      message: 'A value is required for field dummy-field.',
      statusCode: 400,
      errors: [
        {
          code: 'RequiredField',
          field: 'dummy-field',
          message: 'A value is required for field dummy-field.',
        },
      ],
    });
  });

  test('ErrorAuthErrorResponse', async () => {
    const opts: ErrorxAdditionalOpts = {
      privateFields: {},
      privateMessage: '',
      fields: {},
      skipLog: true,
      cause: undefined,
    };
    const authErrorResponse: ErrorAuthErrorResponse = new ErrorAuthErrorResponse('someMessage', opts, '401');

    fastify.get('/', () => {
      throw authErrorResponse;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.json()).toStrictEqual({
      message: 'someMessage',
      statusCode: 401,
      errors: [
        {
          code: '401',
          message: 'someMessage',
        },
      ],
      error: '401',
      error_description: 'someMessage',
    });
  });
});

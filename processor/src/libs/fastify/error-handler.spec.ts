import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import Fastify, { type FastifyInstance } from 'fastify';
import { errorHandler } from './error-handler';
import { Errorx } from '@commercetools/connect-payments-sdk';

describe('error-handler', () => {
  let fastify: FastifyInstance;
  beforeEach(() => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
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
      code: 'ErrorCode',
      message: 'someMessage',
      statusCode: 404,
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
      code: 'ErrorCode',
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
      code: 'General',
      message: 'Internal server error.',
      statusCode: 500,
    });
  });
});

export const ctAPIErrorMock = (statusCode: number, errorCode: string, errorMessage: string) => {
  return {
    code: statusCode,
    statusCode,
    status: statusCode,
    message: errorMessage,
    body: {
      statusCode,
      message: errorMessage,
      errors: [
        {
          code: errorCode,
          message: 'more specific error message',
        },
      ],
    },
    name: errorCode,
  };
};

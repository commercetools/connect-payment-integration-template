export const config = {
  // Required by Payment SDK
  projectKey: process.env.CTP_PROJECT_KEY || 'test',
  clientId: process.env.CTP_CLIENT_ID || 'clientId',
  clientSecret: process.env.CTP_CLIENT_SECRET || 'clientSecret',
  authUrl: process.env.CTP_AUTH_URL || 'http://auth.test.com',
  apiUrl: process.env.CTP_API_URL || 'http://api.test.com',
  sessionUrl: process.env.CTP_SESSION_URL || 'http://session.test.com',

  // Required by logger
  loggerLevel: process.env.LOGGER_LEVEL || 'info',

  // Update with specific payment providers config
  mockClientKey: process.env.MOCK_CLIENT_KEY,
  mockEnvironment: process.env.MOCK_ENVIRONMENT,

  // Payment Providers config
  returnUrl: process.env.RETURN_URL,

  // TODO review these configurations
  // supportedUIElements: convertStringCommaSeparatedValuesToArray(process.env.SUPPORTED_UI_ELEMENTS),
  // enableStoreDetails: process.env.ENABLE_STORE_DETAILS === 'true' ? true : false,
  // sellerReturnUrl: process.env.SELLER_RETURN_URL || ''
};

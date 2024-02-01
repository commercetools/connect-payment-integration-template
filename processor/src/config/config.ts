export const config = {
  // Required by Payment SDK
  projectKey: process.env.CTP_PROJECT_KEY || 'payment-integration',
  clientId: process.env.CTP_CLIENT_ID || 'ejswbLthFjvOgjMoD0oAY1l3',
  clientSecret: process.env.CTP_CLIENT_SECRET || 'v4H0KksThCCeV7Y8vtRgOutNm0O7zoYL',
  authUrl: process.env.CTP_AUTH_URL || 'https://auth.europe-west1.gcp.commercetools.com',
  apiUrl: process.env.CTP_API_URL || 'https://api.europe-west1.gcp.commercetools.com',
  sessionUrl: process.env.CTP_SESSION_URL || 'https://session-dev.europe-west1.gcp.commercetools.com/',

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

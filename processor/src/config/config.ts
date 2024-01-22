const convertStringCommaSeparatedValuesToArray = (supportedUIElements?: string): string[] => {
  if (supportedUIElements) {
    return supportedUIElements.split(',');
  }
  return [];
};

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

  // Required to setup fastify server
  serverPort: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 8080,
  serverHost: process.env.SERVER_HOST || '0.0.0.0',

  // Adyen specific configuration
  adyenEnvironment: process.env.ADYEN_ENVIRONMENT || '',
  adyenClientKey: process.env.ADYEN_CLIENT_KEY || '',
  adyenApiKey: process.env.ADYEN_API_KEY || '',
  adyenHMACKey: process.env.ADYEN_NOTIFICATION_HMAC_KEY || '',
  adyenLiveUrlPrefix: process.env.ADYEN_LIVE_URL_PREFIX || '',
  adyenMerchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT || '',
  adyenReturnUrl: process.env.ADYEN_RETURN_URL || '',

  // TODO review these configurations
  supportedUIElements: convertStringCommaSeparatedValuesToArray(process.env.SUPPORTED_UI_ELEMENTS),
  enableStoreDetails: process.env.ENABLE_STORE_DETAILS === 'true' ? true : false,
  sellerReturnUrl: process.env.SELLER_RETURN_URL || '',
  sellerNotificationUrl: process.env.SELLER_NOTIFICATION_URL || '',
  sellerSendNotiticationEnabled: process.env.SELLER_SEND_NOTIFICATION_ENABLED === 'true' ? true : false,
};

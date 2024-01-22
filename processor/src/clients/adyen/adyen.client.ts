import { Client, CheckoutAPI } from '@adyen/api-library';
import { config } from '../../config/config';

export const AdyenAPI = (): CheckoutAPI => {
  const apiClient = new Client({
    apiKey: config.adyenApiKey,
    environment: config.adyenEnvironment.toUpperCase() as Environment,
    ...(config.adyenLiveUrlPrefix && {
      liveEndpointUrlPrefix: config.adyenLiveUrlPrefix,
    }),
  });

  return new CheckoutAPI(apiClient);
};

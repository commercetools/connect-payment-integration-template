import '@adyen/adyen-web/dist/adyen.css';
import AdyenCheckout from '@adyen/adyen-web';
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import { BaseOptions } from '../components/base';

import { ComponentOptions, PaymentEnabler, EnablerOptions } from './paymentEnabler';
import { Card } from '../components/payment-methods/card';
import { Ideal } from '../components/payment-methods/ideal';
import { Googlepay } from '../components/payment-methods/googlepay';
import { Applepay } from '../components/payment-methods/applepay';

declare global {
  interface ImportMeta {
    env: any;
  }
}

type AdyenEnablerOptions = EnablerOptions & {
  config: Omit<typeof CoreOptions, 'environment' | 'clientKey' | 'session'>;
  onActionRequired?: () => Promise<void>;
};

export class AdyenPaymentEnabler implements PaymentEnabler {
  sessionId: AdyenEnablerOptions['sessionId'];
  processorUrl: AdyenEnablerOptions['processorUrl'];
  config: AdyenEnablerOptions['config'];
  onActionRequired: AdyenEnablerOptions['onActionRequired'];
  onComplete: AdyenEnablerOptions['onComplete'];
  onError: AdyenEnablerOptions['onError'];
  setupData: Promise<{ baseOptions: BaseOptions }>;

  private constructor(options: AdyenEnablerOptions) {
    this.setupData = AdyenPaymentEnabler._Setup(options);
  }

  private static _Setup = async (options: AdyenEnablerOptions): Promise<{ baseOptions: BaseOptions }> => {
    const [sessionResponse, configResponse] = await Promise.all([
      fetch(options.processorUrl + '/payment-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': options.sessionId },
        body: JSON.stringify({}),
      }),
      fetch(options.processorUrl + '/config', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    const [sessionJson, configJson] = await Promise.all([sessionResponse.json(), configResponse.json()]);

    const { sessionData: data, paymentReference } = sessionJson;

    const adyenCheckout = await AdyenCheckout({
      onPaymentCompleted: (result, component) => {
        debugger;
        console.info(result, component);
        window.location.href = options.processorUrl + '/confirm';
      },
      onError: (error, component) => {
        console.error(error.name, error.message, error.stack, component);
      },
      onSubmit: async (state, component) => {
        try {
          const reqData = {
            ...state.data,
            channel: 'Web',
            paymentReference,
          };
          const response = await fetch(options.processorUrl + '/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Session-Id': options.sessionId },
            body: JSON.stringify(reqData),
          });
          const data = await response.json();
          console.log('onSubmit test', state, component, data)
          if (data.action) {
            options.onActionRequired && options.onActionRequired();
            component.handleAction(data.action);
          } else {
            if (data.resultCode === 'Authorised') {
              component.setStatus('success');
              options.onComplete && options.onComplete({ isSuccess: true, paymentReference });
            } else {
              options.onComplete && options.onComplete({ isSuccess: false });
              component.setStatus('error');
            }
          }
        } catch (e) {
          console.log('Payment aborted by client');
          component.setStatus('ready');
        }
      },
      onAdditionalDetails: async (state, component) => {
        console.log('onAdditionalDetails', state, component);
        const requestData = {
          ...state.data,
          paymentReference,
        };
        const response = await fetch(options.processorUrl + '/payments/confirmations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Session-Id': options.sessionId },
          body: JSON.stringify(requestData),
        });
        const data = await response.json();
        if (data.resultCode === 'Authorised') {
          component.setStatus('success');
          options.onComplete && options.onComplete({ isSuccess: true, paymentReference });
        } else {
          options.onComplete && options.onComplete({ isSuccess: false });
          component.setStatus('error');
        }
      },
      analytics: {
        enabled: true,
      },
      // Above properties can be rewritten externally

      // Spread options passed as parameter
      ...options.config,

      // Below options are always overwritten
      environment: configJson.environment,
      clientKey: configJson.clientKey,
      session: {
        id: data.id,
        sessionData: data.sessionData,
      },
    });

    return { 
      baseOptions: {
        adyenCheckout: adyenCheckout
      }
     };
  }

  async createComponent(type: string, componentOptions: ComponentOptions) {
    const { baseOptions } = await this.setupData;
    const supportedMethods = {
      card: Card,
      ideal: Ideal,
      googlepay: Googlepay,
      applepay: Applepay
    }
    if (!Object.keys(supportedMethods).includes(type)) {
      throw new Error(`Component type not supported: ${type}. Supported types: ${Object.keys(supportedMethods).join(', ')}`);
    }
    return new supportedMethods[type](baseOptions, componentOptions);
  }
}

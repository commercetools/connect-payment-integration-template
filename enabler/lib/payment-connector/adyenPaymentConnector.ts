import AdyenCheckout from '@adyen/adyen-web';
import Core from '@adyen/adyen-web/dist/types/core/core';
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';

import { ComponentOptions, PaymentConnector, PaymentError, PaymentResult } from './paymentConnector';
import { Dropin } from '../components/payment-methods/dropin';
import { Card } from '../components/payment-methods/card';
import { Applepay } from '../components/payment-methods/applepay';
import { Ideal } from '../components/payment-methods/ideal';
import { Googlepay } from '../components/payment-methods/googlepay';

declare global {
  interface ImportMeta {
    env: any;
  }
}

type AdyenConnectorOptions = {
  connectorUrl: string;
  sessionId: string;
  config: Omit<typeof CoreOptions, 'environment' | 'clientKey' | 'session'>;
  beforePay?: () => Promise<void>;
  onComplete: (result: PaymentResult) => Promise<void>;
  onError?: (error: PaymentError) => Promise<void>;
};

enum AdyenComponentType {
  dropin = "dropin",
  card = "card",
  applepay = "applepay",
  ideal = "ideal",
  googlepay = "googlepay",
}

export class AdyenPaymentConnector implements PaymentConnector {
  adyenCheckout: typeof Core;
  sessionId: AdyenConnectorOptions['sessionId'];
  connectorUrl: AdyenConnectorOptions['connectorUrl'];
  config: AdyenConnectorOptions['config'];
  beforePay: AdyenConnectorOptions['beforePay'];
  onComplete: AdyenConnectorOptions['onComplete'];
  onError: AdyenConnectorOptions['onError'];
  setupData: Promise<{ adyenCheckout: typeof Core }>;

  private constructor(props: AdyenConnectorOptions) {
    this.sessionId = props.sessionId;
    this.connectorUrl = props.connectorUrl;
    this.config = props.config;
    this.beforePay = props.beforePay;
    this.onComplete = props.onComplete;
    this.onError = props.onError;
    this.setupData = AdyenPaymentConnector._Setup(this);
  }

  private static _Setup = async (instance: AdyenPaymentConnector): Promise<{ adyenCheckout: typeof Core }> => {
    const [sessionResponse, configResponse] = await Promise.all([
      fetch(instance.connectorUrl + '/payment-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': instance.sessionId },
        body: JSON.stringify({}),
      }),
      fetch(instance.connectorUrl + '/config', {
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
        window.location.href = instance.connectorUrl + '/confirm';
      },
      onError: (error, component) => {
        console.error(error.name, error.message, error.stack, component);
      },
      onSubmit: async (state, component) => {
        const reqData = {
          ...state.data,
          channel: 'Web',
          paymentReference,
        };
        const response = await fetch(instance.connectorUrl + '/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Session-Id': instance.sessionId },
          body: JSON.stringify(reqData),
        });
        const data = await response.json();
        console.log('onSubmit', state, component, data)
        if (data.action) {
          component.handleAction(data.action);
        } else {
          if (data.resultCode === 'Authorised') {
            component.setStatus('success');
            instance.onComplete && instance.onComplete({ isSuccess: true, paymentReference });
          } else {
            instance.onComplete && instance.onComplete({ isSuccess: false, paymentReference });
            component.setStatus('error');
          }
        }
      },
      onAdditionalDetails: async (state, component) => {
        console.log('onAdditionalDetails', state, component);
        const requestData = {
          ...state.data,
          paymentReference,
        };
        const response = await fetch(instance.connectorUrl + '/payments/confirmations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Session-Id': instance.sessionId },
          body: JSON.stringify(requestData),
        });
        const data = await response.json();
        if (data.resultCode === 'Authorised') {
          component?.setStatus('success');
          component?.onComplete({ isSuccess: true, paymentReference });
        } else {
          component?.onComplete({ isSuccess: false, paymentReference });
          component?.setStatus('error');
        }
      },
      analytics: {
        enabled: true,
      },
      // Above properties can be rewritten externally

      // Spread options passed as parameter
      ...instance.config,

      // Below options are always overwritten
      environment: configJson.environment,
      clientKey: configJson.clientKey,
      session: {
        id: data.id,
        sessionData: data.sessionData,
      },
    });

    return { adyenCheckout };
  }

  async createComponent(type: string, opts: ComponentOptions) {
    const { adyenCheckout } = await this.setupData;
    switch (type) {
      case AdyenComponentType.dropin: 
      return new Dropin(opts, adyenCheckout);
      case AdyenComponentType.card:
        return new Card(opts, adyenCheckout);
        case AdyenComponentType.applepay:
          return new Applepay(opts, adyenCheckout);
          case AdyenComponentType.ideal:
            return new Ideal(opts, adyenCheckout);
            case AdyenComponentType.googlepay:
              return new Googlepay(opts, adyenCheckout);
    }
    throw new Error(`Component type not supported: ${type}. Supported types: ${Object.keys(AdyenComponentType).join(', ')}`);
  }
}

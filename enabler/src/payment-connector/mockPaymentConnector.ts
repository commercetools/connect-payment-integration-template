import { ComponentOptions, PaymentConnector, PaymentResult, PaymentMethod } from './paymentConnector';
import { Card } from '../components/payment-methods/card/card';
import { FakeSdk } from '../FakeSdk';
import { BaseOptions } from '../components/base';

const SupportedMethods: PaymentMethod[] = ['card'];

declare global {
  interface ImportMeta {
    env: any;
  }
}

type MockConnectorOptions = {
  connectorUrl: string;
  sessionId: string;
  config?: { hidePayButton?: boolean };
  onComplete?: (result: PaymentResult) => void;
  onError?: (error: any) => void;
};

export class MockPaymentConnector implements PaymentConnector {
  sessionId: MockConnectorOptions['sessionId'];
  connectorUrl: MockConnectorOptions['connectorUrl'];
  config: MockConnectorOptions['config'];
  onComplete: MockConnectorOptions['onComplete'];
  onError: MockConnectorOptions['onError'];
  setupData: Promise<{ baseOptions: BaseOptions }>;

  private constructor(props: MockConnectorOptions) {
    this.sessionId = props.sessionId;
    this.connectorUrl = props.connectorUrl;
    this.config = props.config;
    this.onComplete = props.onComplete;
    this.onError = props.onError;
    this.setupData = MockPaymentConnector._Setup(this);
  }

  private static _Setup = async (props: MockConnectorOptions): Promise<{ baseOptions: BaseOptions }> => {
    // Fetch the config from the connector and use it to initialize your SDK:

    // const configResponse = await fetch(instance.connectorUrl + '/config', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    // });

    // const configJson = await configResponse.json();

    const sdkOptions = {
      // environment: configJson.environment,
      environment: 'test'
    }

    return Promise.resolve({ baseOptions: {
      sdk: new FakeSdk(sdkOptions),
      connectorUrl: props.connectorUrl,
      sessionId: props.sessionId,
      environment: sdkOptions.environment,
      config: props.config || {},
      onComplete: props.onComplete || (() => {}),
      onError: props.onError || (() => {}),
     }
    });
  }

  async createComponent(type: string, componentOptions: ComponentOptions) {
    const { baseOptions } = await this.setupData;

    switch (type) {
      case 'card': 
        return new Card(baseOptions, componentOptions);
    }
    throw new Error(`Payment method not supported: ${type}. Supported methods: ${Object.keys(SupportedMethods).join(', ')}`);
  }
}

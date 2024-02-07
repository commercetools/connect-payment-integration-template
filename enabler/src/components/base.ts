import { FakeSdk } from '../FakeSdk';
import { ComponentOptions, PaymentMethod, PaymentResult } from '../payment-connector/paymentConnector';


export type ElementOptions = {
  paymentMethod: PaymentMethod;
  isOffsite?: boolean;
};

export type BaseOptions = {
  sdk: FakeSdk;
  connectorUrl: string;
  sessionId: string;
  environment: string;
  config: any;
  onComplete: (result: PaymentResult) => void;
  onError: (error?: any) => void;
}

/**
 * Base Web Component
 */
export abstract class BaseComponent {
  protected paymentMethod: ElementOptions['paymentMethod'];
  protected sdk: FakeSdk;
  protected connectorUrl: BaseOptions['connectorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected environment: BaseOptions['environment'];
  protected config: BaseOptions['config'];
  protected showPayButton: boolean;

  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    this.sdk = baseOptions.sdk;
    this.connectorUrl = baseOptions.connectorUrl;
    this.sessionId = baseOptions.sessionId;
    this.environment = baseOptions.environment;
    this.config = baseOptions.config;
    this.onComplete = baseOptions.onComplete;
    this.onError = baseOptions.onError;
    this.showPayButton = 
      'showPayButton' in componentOptions.config ? !!componentOptions.config.showPayButton :
        'showPayButton' in baseOptions.config ? !!baseOptions.config.showPayButton :
          true;
  }

  async updated() {}

  abstract submit(): void;

  abstract mount(selector: string): void ;

  onComplete: (result: PaymentResult) => void;
  onError: (error?: any) => void;
}

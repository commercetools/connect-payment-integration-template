import { FakeSdk } from '../fake-sdk';
import { ComponentOptions, PaymentComponent, PaymentMethod, PaymentResult } from '../payment-enabler/payment-enabler';

export type ElementOptions = {
  paymentMethod: PaymentMethod;
};

export type BaseOptions = {
  sdk: FakeSdk;
  processorUrl: string;
  sessionId: string;
  environment: string;
  config: {
    showPayButton?: boolean;
  };
  onComplete: (result: PaymentResult) => void;
  onError: (error?: any) => void;
}

/**
 * Base Web Component
 */
export abstract class BaseComponent implements PaymentComponent {
  protected paymentMethod: ElementOptions['paymentMethod'];
  protected sdk: FakeSdk;
  protected processorUrl: BaseOptions['processorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected environment: BaseOptions['environment'];
  protected config: BaseOptions['config'];
  protected showPayButton: boolean;
  protected onComplete: (result: PaymentResult) => void;
  protected onError: (error?: any) => void;

  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    this.sdk = baseOptions.sdk;
    this.processorUrl = baseOptions.processorUrl;
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

  abstract submit(): void;

  abstract mount(selector: string): void ;

  showValidation?(): void;
  isValid?(): boolean;
  getState?(): {
    card?: {
      endDigits?: string;
      brand?: string;
      expiryDate? : string;
    }
  };
}

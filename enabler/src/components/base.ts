import { FakeSdk } from '../fake-sdk';
import { ComponentOptions, PaymentComponent, PaymentComponentState, PaymentMethod, PaymentResult } from '../payment-enabler/payment-enabler';
import { BaseOptions } from "../payment-enabler/payment-enabler-mock";

export type ElementOptions = {
  paymentMethod: PaymentMethod;
};



/**
 * Base Web Component
 */
export abstract class BaseComponent implements PaymentComponent {
  protected paymentMethod: ElementOptions['paymentMethod'];
  protected sdk: FakeSdk;
  protected processorUrl: BaseOptions['processorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected environment: BaseOptions['environment'];
  protected onComplete: (result: PaymentResult) => void;
  protected onError: (error: any, context?: { paymentReference?: string }) => void;

  constructor(paymentMethod: PaymentMethod, baseOptions: BaseOptions, _componentOptions: ComponentOptions) {
    this.paymentMethod = paymentMethod;
    this.sdk = baseOptions.sdk;
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.environment = baseOptions.environment;
    this.onComplete = baseOptions.onComplete;
    this.onError = baseOptions.onError;
  }

  abstract submit(): Promise<void>;

  abstract mount(selector: string): Promise<void> ;

  showValidation?(): Promise<void>;
  isValid?(): Promise<boolean>;
  getState?(): Promise<PaymentComponentState>;
  isAvailable?(): Promise<boolean>;
}

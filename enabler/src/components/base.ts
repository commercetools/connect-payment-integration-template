import { FakeSdk } from "../fake-sdk";
import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentState,
  PaymentMethod,
  PaymentResult,
} from "../payment-enabler/payment-enabler";
import { BaseOptions } from "../payment-enabler/payment-enabler-mock";

export type ElementOptions = {
  paymentMethod: PaymentMethod;
};

/**
 * Base Web Component
 */
export abstract class BaseComponent implements PaymentComponent {
  protected paymentMethod: ElementOptions["paymentMethod"];
  protected sdk: FakeSdk;
  protected processorUrl: BaseOptions["processorUrl"];
  protected sessionId: BaseOptions["sessionId"];
  protected environment: BaseOptions["environment"];
  protected onComplete: (result: PaymentResult) => void;
  protected onError: (
    error: any,
    context?: { paymentReference?: string },
  ) => void;
  protected getStorePaymentDetails?: () => boolean;
  protected setStorePaymentDetails?: (enabled: boolean) => void;
  protected rootElement?: HTMLElement;

  constructor(
    paymentMethod: PaymentMethod,
    baseOptions: BaseOptions,
    _componentOptions: ComponentOptions,
  ) {
    this.paymentMethod = paymentMethod;
    this.sdk = baseOptions.sdk;
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.environment = baseOptions.environment;
    this.onComplete = baseOptions.onComplete;
    this.onError = baseOptions.onError;
    this.getStorePaymentDetails = baseOptions.getStorePaymentDetails;
    this.setStorePaymentDetails = baseOptions.setStorePaymentDetails;
  }

  abstract submit({
    storePaymentDetails,
  }: {
    storePaymentDetails?: boolean;
  }): Promise<void>;

  abstract mount(selector: string): Promise<void>;

  async remove(): Promise<void> {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }

  /**
   * Renders the template inside a root element at the start of the selector's container,
   * keeping a reference to it so that remove() only deletes what this component mounted.
   */
  protected render(selector: string, template: string): void {
    const root = document.createElement("div");
    root.innerHTML = template;
    document.querySelector(selector).prepend(root);
    this.rootElement = root;
  }

  showValidation?(): Promise<void>;
  isValid?(): Promise<boolean>;
  getState?(): Promise<PaymentComponentState>;
  isAvailable?(): Promise<boolean>;
}

import { FakeSdk } from "../fake-sdk";
import {
  StoredComponentOptions,
  StoredComponent,
  StoredComponentBuilder,
  PaymentMethod,
  CocoStoredPaymentMethod,
  PaymentResult,
} from "../payment-enabler/payment-enabler";
import {
  BaseOptions,
  StoredPaymentMethodsConfig,
} from "../payment-enabler/payment-enabler-mock";

/**
 * Base Web Component
 */
export abstract class MockBaseStoredComponentBuilder
  implements StoredComponentBuilder
{
  public componentHasSubmit = true;

  protected paymentMethod: PaymentMethod;
  protected sessionId: string;
  protected processorUrl: string;
  protected paymentComponentsConfigOverride: Record<string, any>;
  protected storedPaymentMethodsConfig: StoredPaymentMethodsConfig;
  protected baseOptions: BaseOptions;

  constructor(paymentMethod: PaymentMethod, baseOptions: BaseOptions) {
    this.paymentMethod = paymentMethod;
    this.sessionId = baseOptions.sessionId;
    this.processorUrl = baseOptions.processorUrl;
    this.storedPaymentMethodsConfig = baseOptions.storedPaymentMethodsConfig;
    this.baseOptions = baseOptions;
  }

  abstract build(config: StoredComponentOptions): StoredComponent;
}

export abstract class DefaultMockStoredComponent implements StoredComponent {
  protected paymentMethod: PaymentMethod;
  protected sdk: FakeSdk;
  protected componentOptions: StoredComponentOptions;
  protected sessionId: string;
  protected processorUrl: string;
  protected storedPaymentMethodsConfig: StoredPaymentMethodsConfig;
  protected usedCocoStoredPaymentMethod: CocoStoredPaymentMethod;
  protected onComplete: (result: PaymentResult) => void;
  protected onError: (
    error: any,
    context?: { paymentReference?: string },
  ) => void;

  constructor(opts: {
    paymentMethod: PaymentMethod;
    componentOptions: StoredComponentOptions;
    sessionId: string;
    processorUrl: string;
    storedPaymentMethodsConfig: StoredPaymentMethodsConfig;
    baseOptions: BaseOptions;
  }) {
    this.paymentMethod = opts.paymentMethod;
    this.componentOptions = opts.componentOptions;
    this.sessionId = opts.sessionId;
    this.processorUrl = opts.processorUrl;
    this.storedPaymentMethodsConfig = opts.storedPaymentMethodsConfig;
    this.sdk = opts.baseOptions.sdk;
    this.onComplete = opts.baseOptions.onComplete;
    this.onError = opts.baseOptions.onError;
  }

  abstract init(options: { id: string }): void;

  async remove() {
    const url = this.processorUrl.endsWith("/")
      ? `${this.processorUrl}stored-payment-methods/${this.usedCocoStoredPaymentMethod.id}`
      : `${this.processorUrl}/stored-payment-methods/${this.usedCocoStoredPaymentMethod.id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-Session-Id": this.sessionId,
      },
    });

    if (!response.ok) {
      throw new Error("failed for some reason");
    }
  }

  abstract submit(): Promise<void>;

  abstract mount(selector: string): Promise<void>;

  async isAvailable(): Promise<boolean> {
    if (!this.storedPaymentMethodsConfig.isEnabled) {
      console.log(
        `${this.paymentMethod} is not allowed to be used cause the stored payment methods is not enabled`,
      );
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }
}

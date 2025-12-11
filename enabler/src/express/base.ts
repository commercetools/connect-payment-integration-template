import {
  ExpressAddressData,
  ExpressComponent,
  ExpressOptions,
  ExpressShippingOptionData,
  OnComplete,
} from "../payment-enabler/payment-enabler";

export type ShippingMethodCost = {
  [key: string]: string;
};

export abstract class DefaultAdyenExpressComponent implements ExpressComponent {
  protected processorUrl: string;
  protected sessionId: string;
  protected countryCode: string;
  protected currencyCode: string;
  protected expressOptions: ExpressOptions;
  protected availableShippingMethods: ExpressShippingOptionData[];
  protected paymentMethodConfig: { [key: string]: string };
  protected onComplete: OnComplete;

  constructor(opts: {
    expressOptions: ExpressOptions;
    processorUrl: string;
    sessionId: string;
    countryCode: string;
    currencyCode: string;
    paymentMethodConfig: { [key: string]: string };
    onComplete: OnComplete;
  }) {
    this.expressOptions = opts.expressOptions;
    this.processorUrl = opts.processorUrl;
    this.sessionId = opts.sessionId;
    this.countryCode = opts.countryCode;
    this.currencyCode = opts.currencyCode;
    this.paymentMethodConfig = opts.paymentMethodConfig;
    this.onComplete = opts.onComplete;
  }

  abstract init(): void;

  abstract mount(selector: string): Promise<void>;

  async setShippingAddress(opts: {
    address: ExpressAddressData;
  }): Promise<void> {
    if (this.expressOptions.onShippingAddressSelected) {
      await this.expressOptions.onShippingAddressSelected(opts);
      return;
    }

    throw new Error("setShippingAddress not implemented");
  }

  async getShippingMethods(opts: {
    address: ExpressAddressData;
  }): Promise<ExpressShippingOptionData[]> {
    if (this.expressOptions.getShippingMethods) {
      this.availableShippingMethods =
        await this.expressOptions.getShippingMethods(opts);
      return this.availableShippingMethods;
    }

    throw new Error("getShippingMethods not implemented");
  }

  async setShippingMethod(opts: {
    shippingMethod: { id: string };
  }): Promise<void> {
    if (this.expressOptions.onShippingMethodSelected) {
      await this.expressOptions.onShippingMethodSelected(opts);
      return;
    }

    throw new Error("setShippingMethod not implemented");
  }

  protected setSessionId(sessionId): void {
    this.sessionId = sessionId;
  }
}

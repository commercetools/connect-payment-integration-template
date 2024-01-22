import Core from '@adyen/adyen-web/dist/types/core/core';
import { ComponentOptions, PaymentResult } from '../payment-connector/paymentConnector';
import ApplePay from '@adyen/adyen-web/dist/types/components/ApplePay';
import GooglePay from '@adyen/adyen-web/dist/types/components/GooglePay';
import RedirectElement from '@adyen/adyen-web/dist/types/components/Redirect/Redirect';

export type ElementOptions = {
  adyenPaymentMethod: 'card' | 'ideal' | 'googlepay' | 'dropin' | 'applepay' | string;
  isOffsite?: boolean;
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               

/**
 * Base Component
 */
export class BaseComponent {
  protected _paymentMethod: string;
  protected _offsite: boolean = false;
  protected _adyenCheckout: typeof Core;
  protected _config: any;

  public component: typeof ApplePay | typeof GooglePay | typeof RedirectElement;

  constructor(opts: ElementOptions, componentOptions: ComponentOptions, adyenCheckout: typeof Core) {
    this._paymentMethod = opts.adyenPaymentMethod;
    this._offsite = !!opts.isOffsite;
    this._adyenCheckout = adyenCheckout;
    this.beforePay = componentOptions.beforePay || (() => Promise.resolve());
    this.onError = componentOptions.onError;
    this.onComplete = componentOptions.onComplete;
    this.component = this._create();
  }

  beforePay: () => Promise<void>;

  protected _create(): typeof ApplePay | typeof GooglePay | typeof RedirectElement {
    return this._adyenCheckout.create(this._paymentMethod, this._config);
  }

  submit() {
    this.beforePay().then(() => {
      this.component.submit();
    });
  }

  hasSubmit() {
    return true;
  }

  isOffsite() {
    return this._offsite;
  }

  isAvailable() {
    return 'isAvailable' in this.component ? this.component.isAvailable() : Promise.resolve();
  }

  isValid() {
    return this.component.isValid;
  }

  mount(selector: string) {
    this
      .isAvailable()
      .then(() => {
        this.component.mount(selector);
      })
      .catch((e: unknown) => {
        console.log(`${this._paymentMethod } is not available`, e);
      });
  }

  onComplete: ((result: PaymentResult) => Promise<void>) | undefined;

  onError: ((error: any) => Promise<void>) | undefined;
}

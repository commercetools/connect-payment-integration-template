import { BaseComponent } from '../base';
import GooglePay from '@adyen/adyen-web/dist/types/components/GooglePay';
import Core from '@adyen/adyen-web/dist/types/core';
import { ComponentOptions } from '../../payment-connector/paymentConnector';

/**
 * Google pay component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/google-pay/web-component/
 */
export class Googlepay extends BaseComponent {
  constructor(componentOptions: ComponentOptions, adyenCheckout: typeof Core) {
    super({
      adyenPaymentMethod: 'googlepay',
    }, componentOptions, adyenCheckout);
  }

  protected _create() {
    return this._adyenCheckout.create(this._paymentMethod, {
      onClick: (resolve, reject) => {
        this.beforePay()
          .then(() => resolve())
          .catch(() => reject());
      },
      ...this._config,
    }) as unknown as typeof GooglePay;
  }

  hasSubmit() {
    return false;
  }
}

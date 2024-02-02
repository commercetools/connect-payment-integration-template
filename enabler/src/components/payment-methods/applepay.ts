import { BaseComponent } from '../base';
import ApplePay from '@adyen/adyen-web/dist/types/components/ApplePay';
import Core from '@adyen/adyen-web/dist/types/core';
import { ComponentOptions } from '../../payment-connector/paymentConnector';

/**
 * Apple pay component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/apple-pay/web-component/
 */
export class Applepay extends BaseComponent {
  constructor(componentOptions: ComponentOptions, adyenCheckout: typeof Core) {
    super({ adyenPaymentMethod: 'applepay' }, componentOptions, adyenCheckout);
  }

  protected _create() {
    return this._adyenCheckout.create(this._paymentMethod, {
      onClick: (resolve, reject) => {
        this.beforePay()
          .then(() => resolve())
          .catch(() => reject());
      },
      ...this._config,
    }) as unknown as typeof ApplePay;
  }

  hasSubmit() {
    return false;
  }
}

import { BaseComponent } from '../base';
import Core from '@adyen/adyen-web/dist/types/core';
import { ComponentOptions } from '../../payment-connector/paymentConnector';

/**
 * Dropin component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/ideal/web-component/
 */
export class Dropin extends BaseComponent {
  constructor(componentOptions: ComponentOptions, adyenCheckout: typeof Core) {
    super({
      adyenPaymentMethod: 'dropin',
      isOffsite: true,
    }, componentOptions, adyenCheckout);
  }
}

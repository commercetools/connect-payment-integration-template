import { BaseComponent } from '../base';
import Core from '@adyen/adyen-web/dist/types/core';
import { ComponentOptions } from '../../payment-connector/paymentConnector';

/**
 * Ideal component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/ideal/web-component/
 */
export class Ideal extends BaseComponent {
  constructor(componentOptions: ComponentOptions, adyenCheckout: typeof Core) {
    super({
      adyenPaymentMethod: 'ideal',
      isOffsite: true,
    }, componentOptions, adyenCheckout);
  }
}

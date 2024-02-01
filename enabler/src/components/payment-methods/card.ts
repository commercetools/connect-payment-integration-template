import { BaseComponent } from '../base';
import { ComponentOptions } from '../../payment-connector/paymentConnector';
import Core from '@adyen/adyen-web/dist/types/core';

/**
 * Credit card component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/cards/web-component/
 */


export class Card extends BaseComponent {
  constructor(componentOptions: ComponentOptions, adyenCheckout: typeof Core) {
    super({ adyenPaymentMethod: 'card' }, componentOptions, adyenCheckout);
  }
}

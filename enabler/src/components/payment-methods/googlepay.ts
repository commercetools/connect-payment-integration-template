import { BaseComponent, BaseOptions } from '../base';
import { ComponentOptions, PaymentMethod } from '../../payment-enabler/paymentEnabler';

/**
 * Google pay component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/google-pay/web-component/
 */
export class Googlepay extends BaseComponent {
  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.googlepay, baseOptions, componentOptions);
  }
}

import { ComponentOptions, PaymentMethod } from '../../payment-enabler/paymentEnabler';
import { BaseComponent, BaseOptions } from '../base';
/**
 * Ideal component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/ideal/web-component/
 */
export class Ideal extends BaseComponent {
  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.ideal, baseOptions, componentOptions);
  }
}

import { ComponentOptions, PaymentMethod } from '../../payment-enabler/paymentEnabler';
import { BaseComponent, BaseOptions } from '../base';

/**
 * Credit card component
 *
 * Configuration options:
 * https://docs.adyen.com/payment-methods/cards/web-component/
 */


export class Card extends BaseComponent {
  private endDigits: string;

  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.card, baseOptions, componentOptions);
  }

  protected _create() {
    const that = this;
    return this.adyenCheckout.create(this.paymentMethod, {
      onFieldValid : function(data) {
        const { endDigits, fieldType } = data;
        if (endDigits && fieldType === 'encryptedCardNumber') {
          that.endDigits = endDigits;
        }
      },
      ...this.config,
    });
  }


  showValidation() {
    this.component.showValidation();
  }

  isValid() {
    return this.component.isValid;
  }

  getState() {
    return {
      card: {
        endDigits: this.endDigits,
        brand: this.component.state.selectedBrandValue,
      }
    };
  }

}

import { ComponentOptions, PaymentMethod } from '../../../payment-enabler/payment-enabler';
import buttonStyles from '../../../style/button.module.scss';
import styles from '../../../style/style.module.scss';
import { BaseComponent, BaseOptions } from '../../base';

export class Invoice extends BaseComponent {
  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.invoice, baseOptions, componentOptions);
  }

  mount(selector: string) {
    document.querySelector(selector).insertAdjacentHTML("afterbegin", this._getTemplate());
    if (this.showPayButton) {
      document.querySelector('#invoiceForm-paymentButton').addEventListener('click', (e) => {
        e.preventDefault();
        this.submit();
      });
    }
  }

  async submit() {
    // here we would call the SDK to submit the payment
    this.sdk.init({ environment: this.environment });
    try {
      const requestData = {
        paymentMethod: {
            type: this.paymentMethod,
        }
      };
      const response = await fetch(this.processorUrl + '/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': this.sessionId },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();

      if (data.outcome === 'Authorized' && data.paymentReference) {
        this.onComplete && this.onComplete({ isSuccess: true, paymentReference: data.paymentReference });
      } else {
        this.onComplete && this.onComplete({ isSuccess: false });
      }
    } catch(e) {
      this.onError('Some error occurred. Please try again.');
    }
  }

  private _getTemplate() {
    const payButton = this.showPayButton ? `<button class="${buttonStyles.button} ${buttonStyles.fullWidth} ${styles.submitButton}" id="invoiceForm-paymentButton">Pay</button>` : '';
    return `
    <div class="${styles.wrapper}">
      <form class="${styles.paymentForm}">
        ${payButton}
      </form>
      </div>
    `
  }
}

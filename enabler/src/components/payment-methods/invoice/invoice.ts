import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
  PaymentMethod
} from '../../../payment-enabler/payment-enabler';
import {BaseComponent, BaseOptions} from '../../base';
import styles from '../../../style/style.module.scss';
import buttonStyles from "../../../style/button.module.scss";
import {addFormFieldsEventListeners} from "../card/utils.ts";

export class InvoiceBuilder implements PaymentComponentBuilder {
  public componentHasSubmit = true
  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): PaymentComponent {
    return new Invoice(this.baseOptions, config);
  }
}

export class Invoice extends BaseComponent {
  private showPayButton: boolean;

  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.invoice, baseOptions, componentOptions);
    this.showPayButton = componentOptions?.showPayButton ?? false;
  }

  mount(selector: string) {
    document.querySelector(selector).insertAdjacentHTML("afterbegin", this._getTemplate());

    if (this.showPayButton) {
      document.querySelector('#invoiceForm-paymentButton').addEventListener('click', (e) => {
        e.preventDefault();
        this.submit();
      });
    }

    addFormFieldsEventListeners();
  }

  async submit() {
    // here we would call the SDK to submit the payment
    this.sdk.init({ environment: this.environment });
    try {
      const requestData = {
        paymentMethod: this.paymentMethod
      };
      const response = await fetch(this.processorUrl + '/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': this.sessionId },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();

      this.onComplete && this.onComplete({ isSuccess: true, paymentReference: data.paymentReference });
    } catch(e) {
      this.onError('Some error occurred. Please try again.');
    }
  }

  private _getTemplate() {
    const payButton = this.showPayButton ? `<button class="${buttonStyles.button} ${buttonStyles.fullWidth} ${styles.submitButton}" id="invoiceForm-paymentButton">Pay</button>` : '';
    return `
    <div class="${styles.wrapper}">
      <form id="invoiceForm" class="${styles.paymentForm}">
      Pay easily with Invoice and transfer the shopping amount within the specified date.
      ${payButton}
      </form>
    </div>
    `
  }
}

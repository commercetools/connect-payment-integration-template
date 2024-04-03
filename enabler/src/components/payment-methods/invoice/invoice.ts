import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
  PaymentMethod
} from '../../../payment-enabler/payment-enabler';
import {BaseComponent, BaseOptions} from '../../base';
import styles from '../../../style/style.module.scss';

export class InvoiceBuilder implements PaymentComponentBuilder {
  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): PaymentComponent {
    return new Invoice(this.baseOptions, config);
  }
}

export class Invoice extends BaseComponent {
  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.invoice, baseOptions, componentOptions);
  }

  mount(selector: string) {
    document.querySelector(selector).insertAdjacentHTML("afterbegin", this._getTemplate());
    document.querySelector('#invoiceForm').addEventListener('onsubmit', (e) => {
      e.preventDefault();
      this.submit();
    });

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
  return `
    <div class="${styles.wrapper}">
      <form id="invoiceForm" class="${styles.paymentForm}">
      Pay easily with Invoice and transfer the shopping amount within the specified date.
      </form>
    </div>
    `
  }
}

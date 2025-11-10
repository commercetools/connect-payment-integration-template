import {
  PaymentMethod,
  StoredComponent,
  StoredComponentOptions,
} from "../../payment-enabler/payment-enabler";
import {
  BaseOptions,
  StoredPaymentMethodsConfig,
} from "../../payment-enabler/payment-enabler-mock";
import {
  DefaultMockStoredComponent,
  MockBaseStoredComponentBuilder,
} from "../base";

import buttonStyles from "../../style/button.module.scss";
import inputFieldStyles from "../../style/inputField.module.scss";
import styles from "../../style/style.module.scss";
import {
  addFormFieldsEventListenersForStoredCardComponent,
  getInput,
  validateAllFieldsStored,
} from "../../components/payment-methods/card/utils";
import {
  PaymentOutcome,
  PaymentRequestSchemaDTO,
} from "../../dtos/mock-payment.dto";

let cvvFieldIdCounter = 0;
export class StoredCardBuilder extends MockBaseStoredComponentBuilder {
  constructor(baseOptions: BaseOptions) {
    super(PaymentMethod.card, baseOptions);
  }

  build(config: StoredComponentOptions): StoredComponent {
    const cardComponent = new StoredCardComponent({
      paymentMethod: this.paymentMethod,
      componentOptions: config,
      sessionId: this.sessionId,
      processorUrl: this.processorUrl,
      storedPaymentMethodsConfig: this.storedPaymentMethodsConfig,
      baseOptions: this.baseOptions,
    });

    // The stored (card) component will be initialised using a specific CT payment-method id.
    cardComponent.init({
      id: config.id,
    });

    return cardComponent;
  }
}

export class StoredCardComponent extends DefaultMockStoredComponent {
  private showPayButton: boolean;
  private cvvFieldId: string;

  constructor(opts: {
    paymentMethod: PaymentMethod;
    componentOptions: StoredComponentOptions;
    sessionId: string;
    processorUrl: string;
    storedPaymentMethodsConfig: StoredPaymentMethodsConfig;
    baseOptions: BaseOptions;
  }) {
    super(opts);
    this.showPayButton = opts.componentOptions.showPayButton ?? false;
  }

  init({ id }: { id: string }): void {
    this.cvvFieldId = `creditCardForm-cvv-${++cvvFieldIdCounter}`; // Generate a unique ID for the CVV field to avoid conflicts with other cvv fields
    const cocoStoredPaymentMethod =
      this.storedPaymentMethodsConfig.storedPaymentMethods.find((spm) => {
        return spm.id === id;
      });

    if (!cocoStoredPaymentMethod) {
      throw new Error(
        `Received stored payment method id "${id} however that is not an available id to use. Available ones are: [${this.storedPaymentMethodsConfig.storedPaymentMethods.map((spm) => spm.id).join(", ")}]"`,
      );
    }

    this.usedCocoStoredPaymentMethod = cocoStoredPaymentMethod;
  }

  async showValidation() {
    validateAllFieldsStored(this.cvvFieldId);
  }

  async isValid() {
    return validateAllFieldsStored(this.cvvFieldId);
  }

  async submit(): Promise<void> {
    // here we would call the SDK to submit the payment
    this.sdk.init({ environment: "test" });
    const isFormValid = validateAllFieldsStored();
    if (!isFormValid) {
      return;
    }

    try {
      // Below is a mock implementation but not recommend and PCI compliant approach,
      // please use respective PSP iframe capabilities to handle PAN data
      const requestData = {
        paymentMethod: {
          type: this.paymentMethod,
          cvc: getInput(this.cvvFieldId).value,
        },
      };

      // Mock Validation
      let isAuthorized = this.isCreditCardCVCAllowed(
        requestData.paymentMethod.cvc,
      );

      const resultCode = isAuthorized
        ? PaymentOutcome.AUTHORIZED
        : PaymentOutcome.REJECTED;

      const request: PaymentRequestSchemaDTO = {
        paymentMethod: {
          type: this.paymentMethod,
          storedPaymentMethodId: this.usedCocoStoredPaymentMethod.id, // In here we pass the selected CT payment-method ID to the processor.
        },
        paymentOutcome: resultCode,
      };

      const response = await fetch(this.processorUrl + "/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": this.sessionId,
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      const isSuccess = resultCode === PaymentOutcome.AUTHORIZED;

      this.onComplete &&
        this.onComplete({ isSuccess, paymentReference: data.paymentReference });
    } catch (e) {
      this.onError("Some error occurred. Please try again.");
    }
  }

  async mount(selector: string): Promise<void> {
    document
      .querySelector(selector)
      .insertAdjacentHTML("afterbegin", this._getTemplate());

    if (this.showPayButton) {
      document
        .querySelector("#creditCardForm-paymentButton")
        .addEventListener("click", async (e) => {
          e.preventDefault();
          await this.submit();
        });
    }

    if (
      "brand" in this.usedCocoStoredPaymentMethod.displayOptions &&
      typeof this.usedCocoStoredPaymentMethod.displayOptions.brand ===
        "object" &&
      "key" in this.usedCocoStoredPaymentMethod.displayOptions.brand
    ) {
      const brand = this.usedCocoStoredPaymentMethod.displayOptions.brand
        .key as string;
      addFormFieldsEventListenersForStoredCardComponent(brand, this.cvvFieldId);
    }

    return;
  }

  private _getTemplate() {
    const payButton = this.showPayButton
      ? `<button class="${buttonStyles.button} ${buttonStyles.fullWidth} ${styles.submitButton}" id="creditCardForm-paymentButton">Pay</button>`
      : "";
    return `
     <div class="${styles.wrapper}">
       <form class="${styles.paymentForm}">
         <div class="${inputFieldStyles.inputContainer}">
           <p class="${inputFieldStyles.helperText}">* Required fields for payment by credit card <p>
         </div>
         <div class="${inputFieldStyles.inputContainer}">
           <label class="${inputFieldStyles.inputLabel}" for="${this.cvvFieldId}">
             CVC/CVV <span aria-hidden="true"> *</span>
           </label>
           <input class="${inputFieldStyles.inputField}" type="text" id="${this.cvvFieldId}" name="cvv" value="" aria-describedby="${this.cvvFieldId}Input-ally">
           <span class="${styles.hidden} ${inputFieldStyles.errorField}" id="${this.cvvFieldId}Input-ally" role="alert" aria-live="assertive" tabindex="0">Invalid CVV</span>
         </div>
         ${payButton}
       </form>
    </div>
     `;
  }

  private isCreditCardCVCAllowed(cvc: string) {
    const allowedCvCNumbers = ["737"];
    return allowedCvCNumbers.includes(cvc);
  }
}

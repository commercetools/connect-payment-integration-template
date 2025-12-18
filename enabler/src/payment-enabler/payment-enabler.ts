/**
 * Represents the payment enabler. The payment enabler is the entry point for creating the components.
 *
 * Usage:
 *    const enabler = new Enabler({
 *      processorUrl: __VITE_PROCESSOR_URL__,
 *      sessionId: sessionId,
 *      config: {
 *
 *      },
 *      onComplete: ({ isSuccess, paymentReference }) => {
 *        console.log('onComplete', { isSuccess, paymentReference });
 *      },
 *    });
 *
 *    enabler.createComponentBuilder('card')
 *      .then(builder => {
 *          const paymentElement = builder.build({
 *            showPayButton: false,
 *          });
 *          paymentElement.mount('#card-component')
 *      })
 *
 *    enabler.createComponentBuilder('invoice')
 *      .then(builder => {
 *          const paymentElement = builder.build({});
 *          paymentElement.mount('#invoice-component')
 *      })
 */
export interface PaymentEnabler {
  /**
   * Creates a payment component builder of the specified type.
   * @param type - The type of the payment component builder.
   * @returns A promise that resolves to the payment component builder.
   * @throws {Error} If the payment component builder cannot be created.
   */
  createComponentBuilder: (
    type: string
  ) => Promise<PaymentComponentBuilder | never>;

  /**
   * Creates a payment drop-in builder of the specified type.
   * @param type - The type of the payment drop-in builder.
   * @returns A promise that resolves to the payment drop-in builder.
   * @throws {Error} If the payment drop-in builder cannot be created.
   */
  createDropinBuilder: (
    type: DropinType
  ) => Promise<PaymentDropinBuilder | never>;

  /**
   * Creates a stored payment method builder of the specified type.
   * @param type - The type of the stored payment method builder.
   * @returns A promise that resolves to the stored payment method builder.
   * @throws {Error} If the stored payment method builder cannot be created.
   */
  createStoredPaymentMethodBuilder: (
    type: string
  ) => Promise<StoredComponentBuilder | never>;

  /**
   * Creates an express payment builder of the specified type.
   * @param type - The type of the express payment builder.
   * @returns A promise that resolves to the express payment builder.
   * @throws {Error} If the express payment builder cannot be created.
   */
  createExpressBuilder: (
    type: string
  ) => Promise<PaymentExpressBuilder | never>;

  /**
   * Indicates if the stored payment methods is enabled. The actual value should not be determined in the enabled but instead must come from the processor.
   * @returns A promise that resolves to a boolean value
   */
  isStoredPaymentMethodsEnabled: () => Promise<boolean>;

  /**
   * Returns a list of stored payment methods that are available for the current session. The list comes from the processor.
   * @param allowedMethodTypes - A list of allowed types
   * @returns A promise that resolves to a optional list of available stored payment methods.
   */
  getStoredPaymentMethods: ({
    allowedMethodTypes,
  }: {
    allowedMethodTypes: string[];
  }) => Promise<{
    storedPaymentMethods?: StoredPaymentMethod[];
  }>;

  /**
   * If this function is called with "true" then it will indicate to the processor that the user wants to tokenise the payment method. "false" if not.
   * @param type - Boolean value to indicate if the payment method details should be stored or not.
   */
  setStorePaymentDetails(enabled: boolean): void;
}

/**
 * Represents the interface for a payment component.
 */
export type PaymentComponentState = {
  card?: {
    endDigits?: string;
    brand?: string;
    expiryDate?: string;
  };
};

export interface PaymentComponent {
  /**
   * Mounts the payment component to the specified selector.
   * @param selector - The selector where the component will be mounted.
   */
  mount(selector: string): Promise<void>;

  /**
   * Submits the payment.
   */
  submit({
    storePaymentDetails,
  }: {
    storePaymentDetails?: boolean;
  }): Promise<void>;

  /**
   * Shows the validation for the payment component.
   */
  showValidation?(): Promise<void>;

  /**
   * Checks if the payment component is valid.
   * @returns A boolean indicating whether the payment component is valid.
   */
  isValid?(): Promise<boolean>;

  /**
   * Gets the state of the payment component.
   * @returns An object representing the state of the payment component.
   */
  getState?(): Promise<PaymentComponentState>;

  /**
   * Checks if the payment component is available for use.
   * @returns A promise that resolves to a boolean indicating whether the payment component is available.
   */
  isAvailable?(): Promise<boolean>;
}

/**
 * Represents the interface for a payment component builder.
 */
export interface PaymentComponentBuilder {
  /**
   * Indicates whether the component has a submit action.
   */
  componentHasSubmit?: boolean;

  /**
   * Builds a payment component with the specified configuration.
   * @param config - The configuration options for the payment component.
   * @returns The built payment component.
   */
  build(config: ComponentOptions): PaymentComponent;
}

/**
 * Represents the options for the payment enabler.
 */
export type EnablerOptions = {
  /**
   * The URL of the payment processor.
   */
  processorUrl: string;

  /**
   * The session ID for the payment.
   */
  sessionId: string;

  /**
   * The locale for the payment.
   */
  locale?: string;

  /**
   * A callback function that is called when an action is required during the payment process.
   * @returns A promise that resolves when the action is completed.
   */
  onActionRequired?: () => Promise<void>;

  /**
   * A callback function that is called when the payment is completed.
   * @param result - The result of the payment.
   */
  onComplete?: (result: PaymentResult) => void;

  /**
   * A callback function that is called when an error occurs during the payment process.
   * @param error - The error that occurred.
   * @param paymentReference - The payment reference.
   */
  onError?: (error: any, context?: { paymentReference?: string }) => void;
};

/**
 * Represents the payment method code.
 */
export enum PaymentMethod {
  /* Apple Pay */
  applepay = "applepay",
  /* Bancontact card */
  bancontactcard = "bcmc",
  /* Card */
  card = "card",
  /* Custom method */
  customtestmethod = "customtestmethod",
  /* EPS */
  eps = "eps",
  /* Google Pay */
  googlepay = "googlepay",
  /* iDeal */
  ideal = "ideal",
  /* iDeal */
  invoice = "invoice",
  /* Klarna Pay Later */
  klarna_pay_later = "klarna",
  /* Klarna Pay Now */
  klarna_pay_now = "klarna_paynow",
  /* Klarna Pay Over Time */
  klarna_pay_overtime = "klarna_account",
  /* PayPal */
  paypal = "paypal",
  /* Purchase Order */
  purchaseorder = "purchaseorder",
  /* TWINT */
  twint = "twint",
}

/**
 * Represents the result of a payment.
 */
export type PaymentResult =
  | {
      /**
       * Indicates whether the payment was successful.
       */
      isSuccess: true;

      /**
       * The payment reference.
       */
      paymentReference: string;
    }
  | {
      /**
       * Indicates whether the payment was unsuccessful.
       */
      isSuccess: false;

      /**
       * The payment reference.
       */
      paymentReference?: string;
    };

/**
 * Represents the options for a payment component.
 */
export type ComponentOptions = {
  /**
   * Indicates whether to show the pay button.
   */
  showPayButton?: boolean;

  /**
   * A callback function that is called when the pay button is clicked.
   * @returns A Promise indicating whether the payment should proceed.
   */
  onPayButtonClick?: () => Promise<{ storePaymentDetails?: boolean }>;
};

export interface StoredComponent {
  submit(): Promise<void>;
  mount(selector: string): Promise<void>;
  showValidation?(): Promise<void>;
  isValid?(): Promise<boolean>;
  isAvailable?(): Promise<boolean>;
  remove(): Promise<void>;
}

export interface StoredComponentBuilder {
  componentHasSubmit: boolean;
  build(config: StoredComponentOptions): StoredComponent;
}

export type StoredComponentOptions = {
  showPayButton?: boolean;
  onPayButtonClick?: () => Promise<void>;
  id: string;
  brands: string[];
};

type BaseStoredDisplayOptions = {
  logoUrl?: string;
  [key: string]: unknown;
};

type BaseStoredPaymentMethod = {
  id: string;
  type: string;
  createdAt: string; // ISO date string
  isDefault: boolean;
  displayOptions: BaseStoredDisplayOptions;
};

type StoredCardPaymentMethod = BaseStoredPaymentMethod & {
  type: "card";
  displayOptions: BaseStoredDisplayOptions & {
    endDigits?: string;
    brand?: {
      key: string;
    };
    expiryMonth?: number;
    expiryYear?: number;
  };
};

export type StoredPaymentMethod =
  | BaseStoredPaymentMethod
  | StoredCardPaymentMethod;

export type CocoStoredPaymentMethod = StoredPaymentMethod & {
  token: string;
};

/**
 * Represents the payment drop-in types.
 */
export enum DropinType {
  /*
   * The embedded drop-in type which is rendered within the page.
   */
  embedded = "embedded",
  /*
   * The hosted payment page (HPP) drop-in type which redirects the user to a hosted payment page.
   */
  hpp = "hpp",
}

/**
 * Represents the interface for a drop-in component.
 */
export interface DropinComponent {
  /**
   * Submits the drop-in component.
   */
  submit(): Promise<void>;

  /**
   * Mounts the drop-in component to the specified selector.
   * @param selector - The selector where the drop-in component will be mounted.
   */
  mount(selector: string): Promise<void>;
}

/**
 * Represents the options for a drop-in component.
 */
export type DropinOptions = {
  /**
   * Indicates whether to show the pay button.
   **/
  showPayButton?: boolean;

  /**
   * A callback function that is called when the drop-in component is ready.
   * @returns A Promise indicating whether the drop-in component is ready.
   */
  onDropinReady?: () => Promise<void>;

  /**
   * A callback function that is called when the pay button is clicked.
   * @returns A Promise indicating whether the payment should proceed.
   */
  onPayButtonClick?: () => Promise<void>;
};

/**
 * Represents the interface for a payment drop-in builder.
 */
export interface PaymentDropinBuilder {
  /**
   * Indicates whether the drop-in component has a submit action.
   */
  dropinHasSubmit: boolean;

  /**
   * Builds a drop-in component with the specified configuration.
   * @param config - The configuration options for the drop-in component.
   * @returns The built drop-in component.
   */
  build(config: DropinOptions): DropinComponent;
}

export interface ExpressComponent {
  mount(selector: string): void;
}

export type ExpressAddressData = {
  country: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  region?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
};

type OnclickResponse = {
  sessionId: string;
};

export type OnComplete = (opts: {
  isSuccess: boolean;
  paymentReference: string;
  method: {
    type: string;
  };
}) => void;

export type CTAmount = {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
};

// ExpressShippingOptionData can be structured to meet the type contract of the PSP implemented.
export type ExpressShippingOptionData = {
  id: string;
  name: string;
  description?: string;
  isSelected?: boolean;
  amount: CTAmount;
};

export type ExpressOptions = {
  /**
   * A list of ISO 3166 country codes for limiting payments to cards from specific countries.
   */
  allowedCountries?: string[];
  /**
   * A callback function Checkout calls after pay button click. The response of this callback function will include a sessionId to initialize the payment attempt.
   */
  onPayButtonClick: () => Promise<OnclickResponse>;
  /**
   * A callback function that receives an address event when the buyer selects a shipping address in the express checkout pop up.
   @param address The address event received.
   */
  onShippingAddressSelected: (opts: {
    address: ExpressAddressData;
  }) => Promise<void>;
  /**
   * A callback function that retrieves the list of available shipping methods.
   @param address The address to fetch available shipping methods.
   */
  getShippingMethods: (opts: {
    address: ExpressAddressData;
  }) => Promise<ExpressShippingOptionData[]>;
  /**
   * A callback function that receives a shipping method event when the buyer selects a shipping method in the express checkout pop up.
   @param shippingMethod The shippingMethod event received.
   */
  onShippingMethodSelected: (opts: {
    shippingMethod: { id: string };
  }) => Promise<void>;

  /**
   * A Callback called when a payment is authorized.
   @param opts - Authorization event from psp, along with formatted shippingAddress and billingAddress
   */
  onPaymentSubmit: (opts: {
    shippingAddress: ExpressAddressData;
    billingAddress: ExpressAddressData;
  }) => Promise<void>;
  onComplete?: OnComplete;
  
  initialAmount: CTAmount;
};

export interface PaymentExpressBuilder {
  build(config: ExpressOptions): ExpressComponent;
}

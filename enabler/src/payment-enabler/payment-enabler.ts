export interface PaymentComponent {
  mount(selector: string): void;
  submit(): void;
  showValidation?(): void;
  isValid?(): boolean;
  getState?(): {
    card?: {
      endDigits?: string;
      brand?: string;
      expiryDate?: string;
    }
  };
}

export type EnablerOptions = {
  processorUrl: string;
  sessionId: string;
  config?: { 
    locale?: string;
    showPayButton?: boolean;
  };
  onActionRequired?: () => Promise<void>;
  onComplete?: (result: PaymentResult) => void;
  onError?: (error: any) => void;
};


export enum PaymentMethod {
  applepay = "applepay",
  card = "card",
  dropin = "dropin",
  googlepay = "googlepay",
  ideal = "ideal",
  klarna = "klarna",
  paypal = "paypal",
}

export type PaymentResult = {
  isSuccess: true;
  paymentReference: string;
} | { isSuccess: false };

export type ComponentOptions = {
  config: {
    showPayButton?: boolean;
  };
};

export interface PaymentEnabler {
  /** 
   * @throws {Error}
   */
  createComponent: (type: string, opts: ComponentOptions) => Promise<PaymentComponent | never>
}

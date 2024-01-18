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
  config?: { showPayButton?: boolean };
  onComplete?: (result: PaymentResult) => void;
  onError?: (error: any) => void;
};

export type PaymentMethod = 'card';

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
  createComponent: (type: string, opts: ComponentOptions, sessionId?: string) => Promise<PaymentComponent | never>
}

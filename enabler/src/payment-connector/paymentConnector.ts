import { BaseComponent } from '../components/base';

export type PaymentResult = {
  isSuccess: boolean;
  paymentReference: string;
};

export type PaymentError = {
  error: string;
  paymentReference?: string;
};

export type ComponentOptions = {
  id: string;
  config: any;
  beforePay?: () => Promise<void>;
  onComplete: (result: PaymentResult) => Promise<void>;
  onError?: (error: PaymentError) => Promise<void>;
};

export interface PaymentConnector {
  /** 
   * @throws {Error}
   */
  createComponent: (type: string, opts: ComponentOptions) => Promise<BaseComponent | never>
}

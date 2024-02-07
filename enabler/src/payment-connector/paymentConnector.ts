import { BaseComponent } from '../components/base';

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

export interface PaymentConnector {
  /** 
   * @throws {Error}
   */
  createComponent: (type: string, opts: ComponentOptions, sessionId?: string) => Promise<BaseComponent | never>
}

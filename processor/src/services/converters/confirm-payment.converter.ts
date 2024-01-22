import { ConvertConfirmPayment } from '../types/payment.type';
import { PaymentDetailsRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentDetailsRequest';

export class ConfirmPaymentConverter {
  constructor() {}

  public async convert(opts: ConvertConfirmPayment): Promise<PaymentDetailsRequest> {
    return {
      ...opts.data,
    };
  }
}

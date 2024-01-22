import { ConvertCancelPayment } from '../types/payment.type';
import { config } from '../../config/config';
import { PaymentCancelRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentCancelRequest';

export class CancelPaymentConverter {
  constructor() {}

  public async convert(opts: ConvertCancelPayment): Promise<PaymentCancelRequest> {
    return {
      merchantAccount: config.adyenMerchantAccount,
      reference: opts.payment.id,
    };
  }
}

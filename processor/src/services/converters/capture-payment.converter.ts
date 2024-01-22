import { ConvertCapturePayment } from '../types/payment.type';
import { config } from '../../config/config';
import { PaymentCaptureRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentCaptureRequest';

export class CapturePaymentConverter {
  constructor() {}

  public async convert(opts: ConvertCapturePayment): Promise<PaymentCaptureRequest> {
    return {
      merchantAccount: config.adyenMerchantAccount,
      reference: opts.payment.id,
      amount: {
        currency: opts.data.amount.currencyCode,
        value: opts.data.amount.centAmount,
      },
    };
  }
}

import { ConvertRefundPayment } from '../types/payment.type';
import { config } from '../../config/config';
import { PaymentRefundRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentRefundRequest';

export class RefundPaymentConverter {
  constructor() {}

  public async convert(opts: ConvertRefundPayment): Promise<PaymentRefundRequest> {
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

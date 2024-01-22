import { AdyenAPI } from '../clients/adyen/adyen.client';
import { config } from '../config/config';

import { DeleteStoredPaymentMethod, StoredPaymentMethodService } from './types/stored-payment-method.type';

export class DefaultStoredPaymentMethodService implements StoredPaymentMethodService {
  constructor() {}

  public async deleteStoredPaymentMethod(opts: DeleteStoredPaymentMethod): Promise<void> {
    const params = new URLSearchParams();
    params.append('merchantAccount', config.adyenMerchantAccount);
    params.append('shopperReference', opts.customerId);

    await AdyenAPI().RecurringApi.deleteTokenForStoredPaymentDetails(opts.paymentMethodId, { params });
  }
}

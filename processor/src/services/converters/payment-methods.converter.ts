import { ConvertGetPaymentMethods, ConvertPaymentMethodsResponse } from '../types/payment.type';
import { config } from '../../config/config';
import { PaymentMethodsRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentMethodsRequest';
import { CommercetoolsCartService} from '@commercetools/connect-payments-sdk';
import { PaymentMethodsData } from '../../dtos/payment.dto';
import { convertPaymentMethodFromAdyenFormat } from './helper.converter';
import { getSessionContext } from '../../libs/fastify/context/context';

export class PaymentMethodsConverter {
  private ctCartService: CommercetoolsCartService;

  constructor(ctCartService: CommercetoolsCartService) {
    this.ctCartService = ctCartService;
  }

  public async convert(opts: ConvertGetPaymentMethods): Promise<PaymentMethodsRequest> {
    //get cart id from session
    const cart = await this.ctCartService.getCart({
      id: getSessionContext().cartId,
    });
    const paymentAmount = this.ctCartService.getPaymentAmount({
      cart,
    });

    const data: PaymentMethodsRequest = {
      ...opts.data,
      amount: {
        value: paymentAmount.centAmount,
        currency: paymentAmount.currencyCode,
      },
      countryCode: cart.country,
      merchantAccount: config.adyenMerchantAccount,
    };

    return data;
  }

  public convertResponse(opts: ConvertPaymentMethodsResponse): PaymentMethodsData {
    const newData = { ...opts.data };
    const allowedPaymentMethods = getSessionContext().allowedPaymentMethods;
    if (allowedPaymentMethods.length > 0) {
      if (newData.paymentMethods && newData.paymentMethods.length > 0) {
        newData.paymentMethods = newData.paymentMethods.filter((pm) => {
          return pm.type && allowedPaymentMethods.includes(convertPaymentMethodFromAdyenFormat(pm.type));
        });
      }

      if (newData.storedPaymentMethods && newData.storedPaymentMethods.length > 0) {
        newData.storedPaymentMethods = newData.storedPaymentMethods.filter((pm) => {
          return pm.type && allowedPaymentMethods.includes(convertPaymentMethodFromAdyenFormat(pm.type));
        });
      }
    }

    return newData;
  }
}

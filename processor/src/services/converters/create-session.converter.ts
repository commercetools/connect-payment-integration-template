import { CreateCheckoutSessionRequest } from '@adyen/api-library/lib/src/typings/checkout/createCheckoutSessionRequest';
import { PaymentRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentRequest';
import { config } from '../../config/config';
import { ConvertCreateSession } from '../types/payment.type';
import { convertAllowedPaymentMethodsToAdyenFormat, populateCartAddress, populateLineItems } from './helper.converter';

export class CreateSessionConverter {
  constructor() {}

  public async convert(opts: ConvertCreateSession): Promise<CreateCheckoutSessionRequest> {
    const shopperReference = opts.cart.customerId;
    const data: CreateCheckoutSessionRequest = {
      ...opts.data,
      amount: {
        value: opts.payment.amountPlanned.centAmount,
        currency: opts.payment.amountPlanned.currencyCode,
      },
      reference: opts.payment.id,
      merchantAccount: config.adyenMerchantAccount,
      countryCode: opts.cart.country,
      returnUrl: config.adyenReturnUrl + `?paymentReference=${opts.payment.id}`,
      channel: CreateCheckoutSessionRequest.ChannelEnum.Web, //TODO: this should be dynamic
      allowedPaymentMethods: convertAllowedPaymentMethodsToAdyenFormat(),
      ...(config.enableStoreDetails &&
        shopperReference && {
          storePaymentMethod: true,
          shopperReference,
          recurringProcessingModel: PaymentRequest.RecurringProcessingModelEnum.CardOnFile,
          storePaymentMethodMode: CreateCheckoutSessionRequest.StorePaymentMethodModeEnum.AskForConsent,
        }),
      lineItems: populateLineItems(opts.cart),
      ...(opts.cart.billingAddress && {
        billingAddress: populateCartAddress(opts.cart.billingAddress),
      }),
      ...(opts.cart.shippingAddress && {
        deliveryAddress: populateCartAddress(opts.cart.shippingAddress),
      }),
      shopperEmail: opts.cart.customerEmail,
    };
    //TODO: check the info to include depending on the payment method

    return data;
  }
}

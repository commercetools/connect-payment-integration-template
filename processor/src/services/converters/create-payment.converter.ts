import { PaymentRequest } from '@adyen/api-library/lib/src/typings/checkout/paymentRequest';
import { ConvertCreatePayment } from '../types/payment.type';
import { config } from '../../config/config';
import { ThreeDSRequestData } from '@adyen/api-library/lib/src/typings/checkout/threeDSRequestData';
import { Cart } from '@commercetools/platform-sdk';
import { Address } from '@adyen/api-library/lib/src/typings/checkout/address';
import { populateCartAddress, populateLineItems } from './helper.converter';

export class CreatePaymentConverter {
  constructor() {}

  public async convert(opts: ConvertCreatePayment): Promise<PaymentRequest> {
    const shopperReference = opts.cart.customerId;
    const { paymentReference, ...requestData } = opts.data;
    let data: PaymentRequest = {
      ...requestData,
      amount: {
        value: opts.payment.amountPlanned.centAmount,
        currency: opts.payment.amountPlanned.currencyCode,
      },
      reference: opts.payment.id,
      merchantAccount: config.adyenMerchantAccount,
      countryCode: opts.cart.country,
      shopperEmail: opts.cart.customerEmail,
      returnUrl: config.adyenReturnUrl + `?paymentReference=${opts.payment.id}`,
      ...(opts.cart.billingAddress && {
        billingAddress: populateCartAddress(opts.cart.billingAddress),
      }),
      ...(opts.cart.shippingAddress && {
        deliveryAddress: populateCartAddress(opts.cart.shippingAddress),
      }),
      ...(config.enableStoreDetails &&
        shopperReference &&
        opts.data.storePaymentMethod && {
          shopperReference,
          recurringProcessingModel: PaymentRequest.RecurringProcessingModelEnum.CardOnFile,
        }),
    };

    data = this.populateAddionalPaymentMethodData(data, opts.cart);
    return data;
  }

  private populateAddionalPaymentMethodData(data: PaymentRequest, cart: Cart): PaymentRequest {
    switch (data.paymentMethod.type) {
      case 'scheme':
        return this.populateAdditionalCardData(data, cart);
      case 'klarna':
      case 'klarna_paynow':
      case 'klarna_account': {
        const newData = { ...data };
        newData.lineItems = populateLineItems(cart);
        return newData;
      }
      default:
        return data;
    }
  }

  private populateAdditionalCardData(data: PaymentRequest, cart: Cart): PaymentRequest {
    const newData = { ...data };
    newData.authenticationData = {
      threeDSRequestData: {
        nativeThreeDS: ThreeDSRequestData.NativeThreeDSEnum.Preferred,
      },
    };
    return newData;
  }
}

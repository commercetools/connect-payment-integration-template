import { Address } from '@adyen/api-library/lib/src/typings/checkout/address';
import { LineItem } from '@adyen/api-library/lib/src/typings/checkout/lineItem';
import { Cart, LineItem as CoCoLineItem, CustomLineItem, Address as CartAddress } from '@commercetools/platform-sdk';
import { getSessionContext } from '../../libs/fastify/context/context';

export const populateLineItems = (cart: Cart): LineItem[] => {
  const lineItems: LineItem[] = [];

  cart.lineItems.forEach((lineItem) => {
    lineItems.push({
      description: Object.values(lineItem.name)[0], //TODO: get proper locale
      quantity: lineItem.quantity,
      amountExcludingTax: getAmountExcludingTax(lineItem),
      amountIncludingTax: getAmountIncludingTax(lineItem),
      taxAmount: getTaxAmount(lineItem),
      taxPercentage: convertTaxPercentageToCentAmount(lineItem.taxRate?.amount),
    });
  });

  cart.customLineItems.forEach((customLineItem) => {
    lineItems.push({
      description: Object.values(customLineItem.name)[0], //TODO: get proper locale
      quantity: customLineItem.quantity,
      amountExcludingTax: getAmountExcludingTax(customLineItem),
      amountIncludingTax: getAmountIncludingTax(customLineItem),
      taxAmount: getTaxAmount(customLineItem),
      taxPercentage: convertTaxPercentageToCentAmount(customLineItem.taxRate?.amount),
    });

    if (cart.shippingInfo) {
      lineItems.push({
        description: 'Shipping',
        quantity: 1,
        amountExcludingTax: cart.shippingInfo.taxedPrice?.totalNet.centAmount || 0,
        amountIncludingTax: cart.shippingInfo.taxedPrice?.totalGross.centAmount || 0,
        taxAmount: cart.shippingInfo.taxedPrice?.totalTax?.centAmount || 0,
        taxPercentage: convertTaxPercentageToCentAmount(cart.shippingInfo?.taxRate?.amount),
      });
    }
  });

  return lineItems;
};

export const populateCartAddress = (address: CartAddress): Address => {
  return {
    country: address?.country || '',
    city: address?.city || '',
    street: address?.streetName || '',
    houseNumberOrName: address?.streetNumber || '',
    stateOrProvince: address?.region || address?.state || undefined,
    postalCode: address?.postalCode || '',
  };
};

export const convertAllowedPaymentMethodsToAdyenFormat = (): string[] => {
  const allowedPaymentMethods: string[] = getSessionContext().allowedPaymentMethods;
  const adyenAllowedPaymentMethods: string[] = [];
  allowedPaymentMethods.forEach((paymentMethod) => {
    adyenAllowedPaymentMethods.push(convertPaymentMethodToAdyenFormat(paymentMethod));
  });
  return adyenAllowedPaymentMethods;
};

export const convertPaymentMethodToAdyenFormat = (paymentMethod: string): string => {
  if (paymentMethod === 'card') {
    return 'scheme';
  } else {
    return paymentMethod;
  }
};

export const convertPaymentMethodFromAdyenFormat = (paymentMethod: string): string => {
  if (paymentMethod === 'scheme') {
    return 'card';
  } else {
    return paymentMethod;
  }
};

const getAmountIncludingTax = (lineItem: CoCoLineItem | CustomLineItem): number => {
  return lineItem.taxedPrice ? lineItem.taxedPrice.totalGross.centAmount : lineItem.totalPrice.centAmount;
};

const getAmountExcludingTax = (lineItem: CoCoLineItem | CustomLineItem): number => {
  return lineItem.taxedPrice ? lineItem.taxedPrice.totalNet.centAmount : lineItem.totalPrice.centAmount;
};

const getTaxAmount = (lineItem: CoCoLineItem | CustomLineItem): number => {
  return lineItem.taxedPrice?.totalTax ? lineItem.taxedPrice.totalTax.centAmount : 0;
};

const convertTaxPercentageToCentAmount = (decimalTaxRate?: number): number => {
  return decimalTaxRate ? decimalTaxRate * 100 * 100 : 0;
};

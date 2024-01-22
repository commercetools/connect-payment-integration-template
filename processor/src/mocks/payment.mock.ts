import { Payment } from '@commercetools/platform-sdk';

export const paymentMock = {
  id: 'paymentId',
  version: 1,
  createdAt: '2023-10-19T15:02:03.337Z',
  lastModifiedAt: '2023-10-19T15:02:03.860Z',
  key: 'paymentKey',
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 2000,
    fractionDigits: 2,
  },
  paymentMethodInfo: {
    paymentInterface: 'ct-adyen',
    method: 'card',
  },
  paymentStatus: {},
  transactions: [
    {
      id: '1',
      timestamp: '2023-10-19T15:02:03.355Z',
      type: 'Authorization',
      amount: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 2000,
        fractionDigits: 2,
      },
      state: 'Initial',
    },
  ],
  interfaceInteractions: [],
} as Payment;

import { PaymentNotificationData } from '../dtos/notification.dto';

export const successAuthorizationNotification = {
  live: 'false',
  notificationItems: [
    {
      NotificationRequestItem: {
        additionalData: {
          expiryDate: '12/2012',
          authCode: '1234',
          cardSummary: '7777',
          cardHolderName: 'J. De Tester',
          totalFraudScore: '10',
          hmacSignature: 'jVWlqkKseg+xQTg7E2uLEdSyPrslhTqbRvgej03qPks=',
        },
        amount: {
          currency: 'EUR',
          value: 1000,
        },
        eventCode: 'AUTHORISATION' as any,
        eventDate: '2023-10-23T15:41:20+02:00',
        merchantAccountCode: 'Commercetools008_CONNECT_TEST',
        merchantReference: '8313842560770001',
        operations: ['CANCEL', 'CAPTURE', 'REFUND'] as any,
        paymentMethod: 'visa',
        pspReference: 'KSVXXRRBZ379R782',
        reason: '1234:7777:12/2012',
        success: 'true' as any,
      },
    },
  ],
} as PaymentNotificationData;

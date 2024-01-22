import { Money } from '@commercetools/platform-sdk';
import { ConvertNotification } from '../types/notification.type';
import { NotificationRequestItem } from '@adyen/api-library/lib/src/typings/notification/notificationRequestItem';
import { TransactionData, UpdatePayment } from '@commercetools/connect-payments-sdk/dist/commercetools/types/payment.type';

export class NotificationConverter {
  constructor() {}

  public async convert(opts: ConvertNotification): Promise<UpdatePayment> {
    const item = opts.data.notificationItems[0].NotificationRequestItem;

    return {
      id: item.merchantReference,
      pspReference: item.pspReference,
      transaction: this.populateTransaction(item),
    };
  }

  private populateTransaction(item: NotificationRequestItem): TransactionData {
    switch (item.eventCode) {
      case NotificationRequestItem.EventCodeEnum.Authorisation:
        return {
          type: 'Authorization',
          state: item.success ? 'Success' : 'Failure',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      case NotificationRequestItem.EventCodeEnum.Capture:
        return {
          type: 'Charge',
          state: 'Failure',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      case NotificationRequestItem.EventCodeEnum.CaptureFailed:
        return {
          type: 'Charge',
          state: 'Failure',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      case NotificationRequestItem.EventCodeEnum.Cancellation:
        return {
          type: 'CancelAuthorization',
          state: item.success ? 'Success' : 'Failure',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      case NotificationRequestItem.EventCodeEnum.Refund:
        return {
          type: 'Refund',
          state: item.success ? 'Success' : 'Failure',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      case NotificationRequestItem.EventCodeEnum.RefundFailed:
        return {
          type: 'Refund',
          state: 'Failure',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      case NotificationRequestItem.EventCodeEnum.Chargeback:
        return {
          type: 'Chargeback',
          state: 'Success',
          amount: this.populateAmount(item),
          interactionId: item.pspReference,
        };
      default:
        //TODO: throw unsupported notification error
        throw new Error('Unsupported notification');
    }
  }

  private populateAmount(item: NotificationRequestItem): Money {
    return {
      centAmount: item.amount.value as number,
      currencyCode: item.amount.currency as string,
    };
  }
}

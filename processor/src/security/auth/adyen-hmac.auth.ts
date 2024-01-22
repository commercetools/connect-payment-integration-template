import { NotificationAuthenticator, ProcessNotification } from '../../services/types/notification.type';
import HmacValidator from '@adyen/api-library/lib/src/utils/hmacValidator';
import { config } from '../../config/config';

export class DefaultNotificationAuthenticator implements NotificationAuthenticator {
  constructor() {}

  public async authenticate(opts: ProcessNotification): Promise<void> {
    if (!opts.data.notificationItems || opts.data.notificationItems.length === 0) {
      //TODO: throw an error
    }

    const validator = new HmacValidator();
    const item = opts.data.notificationItems[0].NotificationRequestItem;

    if (!validator.validateHMAC(item, config.adyenHMACKey)) {
      //TODO: throw an error
    }
  }
}

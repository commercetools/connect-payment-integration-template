import { CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { PaymentNotificationData } from '../../dtos/notification.dto';

export type ProcessNotification = {
  data: PaymentNotificationData;
};

export type ConvertNotification = {
  data: PaymentNotificationData;
};

export type NotificationAuthenticator = {
  authenticate(opts: ProcessNotification): Promise<void>;
};

export type PaymentEvent = {
  paymentId: string;
  isSuccess: boolean;
};

export type NotificationServiceOptions = {
  ctPaymentService: CommercetoolsPaymentService;
};

export interface NotificationService {
  processNotification(opts: ProcessNotification): Promise<void>;
}

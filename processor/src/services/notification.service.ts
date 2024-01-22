import { CommercetoolsPaymentService } from '@commercetools/connect-payments-sdk';
import { NotificationConverter } from './converters/notification.converter';
import { NotificationService, NotificationServiceOptions, ProcessNotification } from './types/notification.type';

export class DefaultNotificationService implements NotificationService {
  private ctPaymentService: CommercetoolsPaymentService;
  private notificationConverter: NotificationConverter;

  constructor(opts: NotificationServiceOptions) {
    this.ctPaymentService = opts.ctPaymentService;
    this.notificationConverter = new NotificationConverter();
  }

  public async processNotification(opts: ProcessNotification): Promise<void> {
    const updateData = await this.notificationConverter.convert(opts);
    await this.ctPaymentService.updatePayment(updateData);
  }

  //   private async notifyMerchant(updateData: UpdatePayment): Promise<void> {
  //     try {
  //       if (config.sellerSendNotiticationEnabled && this.shouldSendEvent(updateData)) {
  //         const event: PaymentEvent = {
  //           paymentId: updateData.id,
  //           isSuccess: this.isSuccessfulPayment(updateData),
  //         };
  //         await axios.post(`${config.sellerNotificationUrl}`, event);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }

  //   private shouldSendEvent(updateData: UpdatePayment): boolean {
  //     return updateData.transaction?.type === 'Authorization';
  //   }

  //   private isSuccessfulPayment(updateData: UpdatePayment): boolean {
  //     return updateData.transaction?.state === 'Success';
  //   }
}

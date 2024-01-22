import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PaymentNotificationData } from '../dtos/notification.dto';
import { NotificationAuthenticator, NotificationService } from '../services/types/notification.type';

const ACK_NOTIFICATION = '[accepted]';

type NotificationRoutesOptions = {
  authenticator: NotificationAuthenticator;
  notificationService: NotificationService;
};

export const notificationRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & NotificationRoutesOptions,
) => {
  fastify.post<{ Body: PaymentNotificationData; Reply: any }>('/notifications', {}, async (request, reply) => {
    try {
      await opts.authenticator.authenticate({
        data: request.body,
      });
    } catch (e) {
      return reply.status(401).send('Unauthorized');
    }

    const resp = await opts.notificationService.processNotification({
      data: request.body,
    });

    return reply.status(200).send(ACK_NOTIFICATION);
  });
};

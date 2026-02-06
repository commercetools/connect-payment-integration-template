import { paymentSDK } from '../payment-sdk';
import { MockPaymentService } from '../services/mock-payment.service';

const paymentService = new MockPaymentService({
  ctCartService: paymentSDK.ctCartService,
  ctPaymentService: paymentSDK.ctPaymentService,
});

export const app = {
  services: {
    paymentService,
  },
};

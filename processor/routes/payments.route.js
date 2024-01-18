import { Router } from 'express';

import { paymentHandler } from "../controller/payment.controller.js";

const taxCalculatorRouter = Router();

taxCalculatorRouter.post('/payment-methods', paymentHandler);

export default taxCalculatorRouter;

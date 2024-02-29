import {
    CommercetoolsCartService,
    CommercetoolsPaymentService,
    ErrorInvalidJsonInput,
    ErrorInvalidOperation,
} from '@commercetools/connect-payments-sdk';
import {
    CancelPaymentRequest,
    CapturePaymentRequest,
    ConfigResponse,
    ModifyPayment,
    PaymentProviderModificationResponse,
    RefundPaymentRequest,
    StatusResponse,
} from './types/operation.type';
import {
    AmountSchemaDTO,
    PaymentIntentResponseSchemaDTO,
    PaymentModificationStatus,
} from '../dtos/operations/payment-intents.dto';

import { Payment } from '@commercetools/platform-sdk';
import { SupportedPaymentComponentsSchemaDTO } from '../dtos/operations/payment-componets.dto';

export abstract class AbstractPaymentService {
    protected ctCartService: CommercetoolsCartService;
    protected ctPaymentService: CommercetoolsPaymentService;

    protected constructor(ctCartService: CommercetoolsCartService, ctPaymentService: CommercetoolsPaymentService) {
        this.ctCartService = ctCartService;
        this.ctPaymentService = ctPaymentService;
    }

    /**
     * Get configuration information
     * @returns
     */
    abstract config(): Promise<ConfigResponse>;

    /**
     * Get stats information
     * @returns
     */
    abstract status(): Promise<StatusResponse>;

    /**
     * Get supported payment components by the processor
     */
    abstract getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO>;

    /**
     * Capture payment
     * @param request
     * @returns
     */
    abstract capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse>;

    /**
     * Cancel payment
     * @param request
     * @returns
     */
    abstract cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse>;

    /**
     * Refund payment
     * @param request
     * @returns
     */
    abstract refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse>;

    public async modifyPayment(opts: ModifyPayment): Promise<PaymentIntentResponseSchemaDTO> {

        const ctPayment = await this.ctPaymentService.getPayment({
            id: opts.paymentId,
        });
        const request = opts.data.actions[0];

        let requestAmount!: AmountSchemaDTO;
        if (request.action != 'cancelPayment') {
            requestAmount = request.amount;
        } else {
            requestAmount = ctPayment.amountPlanned;
        }

        const transactionType = this.getPaymentTransactionType(request.action);
        const updatedPayment = await this.ctPaymentService.updatePayment({
            id: ctPayment.id,
            transaction: {
                type: transactionType,
                amount: requestAmount,
                state: 'Initial',
            },
        });
        const res = await this.processPaymentModification(updatedPayment, transactionType, requestAmount);

        await this.ctPaymentService.updatePayment({
            id: ctPayment.id,
            transaction: {
                type: transactionType,
                amount: requestAmount,
                interactionId: res.pspReference,
                state: res.outcome === PaymentModificationStatus.APPROVED ? 'Success' : 'Failure',
            },
        });

        return {
            outcome: res.outcome,
        };
    }

    protected getPaymentTransactionType(action: string): string {
        switch (action) {
            case 'cancelPayment': {
                return 'CancelAuthorization';
            }
            case 'capturePayment': {
                return 'Charge';
            }
            case 'refundPayment': {
                return 'Refund';
            }
            // TODO: Handle Error case
            default: {
                throw new ErrorInvalidJsonInput(`Request body does not contain valid JSON.`);
            }
        }
    }

    protected async processPaymentModification(
        payment: Payment,
        transactionType: string,
        requestAmount: AmountSchemaDTO,
    ) {
        switch (transactionType) {
            case 'CancelAuthorization': {
                return await this.cancelPayment({ payment });
            }
            case 'Charge': {
                return await this.capturePayment({ amount: requestAmount, payment });
            }
            case 'Refund': {
                return await this.refundPayment({ amount: requestAmount, payment });
            }
            default: {
                throw new ErrorInvalidOperation(`Operation ${transactionType} not supported.`);
            }
        }
    }
}

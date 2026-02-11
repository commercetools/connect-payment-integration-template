/**
 * Custom types for Payment Methods since they were removed from the SDK
 */
export type PaymentMethod = {
  id: string;
  version: number;
  createdAt: string;
  lastModifiedAt: string;
  customer?: {
    typeId: 'customer';
    id: string;
  };
  method?: string;
  paymentInterface: string;
  interfaceAccount?: string;
  token?: {
    typeId: 'string';
    value: string;
  };
  default?: boolean;
};

export type PaymentMethodPagedQueryResponse = {
  limit: number;
  count: number;
  total: number;
  offset: number;
  results: PaymentMethod[];
};

export type PaymentMethodServiceOptions = {
  ctAPI: any; // Using any since the API type is not exported
};

export type SavePaymentMethodOptions = {
  customerId: string;
  method: string;
  paymentInterface: string;
  interfaceAccount?: string;
  token: string;
  default?: boolean;
};

export type GetPaymentMethodOptions = {
  id: string;
  customerId?: string;
};

export type FindPaymentMethodOptions = {
  customerId: string;
  paymentInterface: string;
  interfaceAccount?: string;
};

export type DeletePaymentMethodOptions = {
  id: string;
  version: number;
  customerId?: string;
};

/**
 * Custom Payment Method Service to replace the removed CommercetoolsPaymentMethodService
 *
 * NOTE: This is a stub implementation since PaymentMethod support was removed from the SDK.
 * In a real implementation, you would need to integrate with the commercetools platform API directly
 * or use a different approach for handling stored payment methods.
 */
export class CustomPaymentMethodService {
  private ctAPI: any;

  constructor(opts: PaymentMethodServiceOptions) {
    this.ctAPI = opts.ctAPI;
  }

  /**
   * Save a new payment method
   */
  async save(opts: SavePaymentMethodOptions): Promise<PaymentMethod> {
    // This is a stub implementation - the actual commercetools paymentMethods API may not be available
    // You would need to implement this based on your PSP's tokenization approach
    console.warn('PaymentMethod save is not fully implemented - returning mock data');
    return {
      id: 'stub-payment-method-id',
      version: 1,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      customer: {
        typeId: 'customer',
        id: opts.customerId,
      },
      method: opts.method,
      paymentInterface: opts.paymentInterface,
      interfaceAccount: opts.interfaceAccount,
      token: {
        typeId: 'string',
        value: opts.token,
      },
      default: opts.default,
    };
  }

  /**
   * Get a payment method by ID
   */
  async get(opts: GetPaymentMethodOptions): Promise<PaymentMethod> {
    console.warn('PaymentMethod get is not fully implemented - returning mock data');
    return {
      id: opts.id,
      version: 1,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      method: 'card',
      paymentInterface: 'mock',
      token: {
        typeId: 'string',
        value: 'stub-token',
      },
    };
  }

  /**
   * Find payment methods by customer ID and payment interface
   */
  async find(opts: FindPaymentMethodOptions): Promise<PaymentMethodPagedQueryResponse> {
    console.warn('PaymentMethod find is not fully implemented - returning empty results');
    return {
      limit: 20,
      count: 0,
      total: 0,
      offset: 0,
      results: [],
    };
  }

  /**
   * Delete a payment method
   */
  async delete(opts: DeletePaymentMethodOptions): Promise<PaymentMethod> {
    console.warn('PaymentMethod delete is not fully implemented - returning mock data');
    return {
      id: opts.id,
      version: 1,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      method: 'card',
      paymentInterface: 'mock',
    };
  }
}

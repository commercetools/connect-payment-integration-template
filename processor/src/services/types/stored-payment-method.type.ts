export type DeleteStoredPaymentMethod = {
  paymentMethodId: string;
  customerId: string;
};

export interface StoredPaymentMethodService {
  deleteStoredPaymentMethod(opts: DeleteStoredPaymentMethod): Promise<void>;
}

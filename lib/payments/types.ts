export type PaymentProviderType = 'cash_counter' | 'cash_table' | 'bkash' | 'nagad' | 'card' | 'stripe';

export interface PaymentInitiateRequest {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  amount: number;
  currency: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  instructions?: string;
  provider: PaymentProviderType;
  message?: string;
}

export interface PaymentVerifyRequest {
  orderId: string;
  transactionId: string;
  paymentMethod: PaymentProviderType;
}

export interface PaymentVerifyResponse {
  isVerified: boolean;
  status: 'paid' | 'unpaid' | 'failed';
  amount: number;
  providerRef?: string;
}

export interface PaymentProvider {
  name: string;
  type: PaymentProviderType;
  description: string;
  iconName: string;
  isOnline: boolean;
  initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse>;
}

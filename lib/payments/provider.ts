import {
  PaymentProvider,
  PaymentProviderType,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./types";

export class CashCounterProvider implements PaymentProvider {
  name = "Pay at Counter";
  type: PaymentProviderType = "cash_counter";
  description = "Pay by cash or card at the cashier desk after your meal.";
  iconName = "Store";
  isOnline = false;

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return {
      success: true,
      transactionId: `CASH_CTR_${req.orderNumber.replace('#', '')}`,
      provider: "cash_counter",
      instructions: "Please visit the cashier counter and present your order number when you are ready to pay.",
    };
  }

  async verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    return {
      isVerified: true,
      status: "paid",
      amount: 0,
      providerRef: req.transactionId,
    };
  }
}

export class CashTableProvider implements PaymentProvider {
  name = "Pay at Table";
  type: PaymentProviderType = "cash_table";
  description = "A server will bring your bill and collect cash or card at your table.";
  iconName = "Wallet";
  isOnline = false;

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return {
      success: true,
      transactionId: `CASH_TBL_${req.orderNumber.replace('#', '')}`,
      provider: "cash_table",
      instructions: "Your server will bring the physical receipt to your table for settlement.",
    };
  }

  async verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    return {
      isVerified: true,
      status: "paid",
      amount: 0,
      providerRef: req.transactionId,
    };
  }
}

export class BkashPaymentProvider implements PaymentProvider {
  name = "bKash Online";
  type: PaymentProviderType = "bkash";
  description = "Instant payment via bKash mobile wallet.";
  iconName = "Smartphone";
  isOnline = true;

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    // In production, invoke bKash checkout API: https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create
    const mockTrx = `BKASH_${Date.now()}`;
    return {
      success: true,
      transactionId: mockTrx,
      provider: "bkash",
      instructions: "Proceed with bKash PIN verification or scan bKash merchant QR code.",
      message: `Simulated bKash transaction initiated for ${req.currency}${req.amount}`,
    };
  }

  async verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    return {
      isVerified: true,
      status: "paid",
      amount: 0,
      providerRef: req.transactionId,
    };
  }
}

export class NagadPaymentProvider implements PaymentProvider {
  name = "Nagad Online";
  type: PaymentProviderType = "nagad";
  description = "Direct payment through Nagad digital account.";
  iconName = "CreditCard";
  isOnline = true;

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const mockTrx = `NAGAD_${Date.now()}`;
    return {
      success: true,
      transactionId: mockTrx,
      provider: "nagad",
      instructions: "Authenticate on Nagad payment gateway.",
    };
  }

  async verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    return {
      isVerified: true,
      status: "paid",
      amount: 0,
      providerRef: req.transactionId,
    };
  }
}

export class CardPaymentProvider implements PaymentProvider {
  name = "Credit / Debit Card";
  type: PaymentProviderType = "card";
  description = "Visa, Mastercard, Amex via secure payment gateway.";
  iconName = "CreditCard";
  isOnline = true;

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return {
      success: true,
      transactionId: `CARD_${Date.now()}`,
      provider: "card",
      instructions: "Secure 256-bit encrypted card checkout.",
    };
  }

  async verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    return {
      isVerified: true,
      status: "paid",
      amount: 0,
      providerRef: req.transactionId,
    };
  }
}

// Registry
export const AVAILABLE_PAYMENT_PROVIDERS: PaymentProvider[] = [
  new CashCounterProvider(),
  new CashTableProvider(),
  new BkashPaymentProvider(),
  new NagadPaymentProvider(),
  new CardPaymentProvider(),
];

export function getPaymentProvider(type: PaymentProviderType): PaymentProvider {
  const match = AVAILABLE_PAYMENT_PROVIDERS.find(p => p.type === type);
  return match || AVAILABLE_PAYMENT_PROVIDERS[0];
}

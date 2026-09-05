import { Money } from "../../../shared/domain/Money";

export interface PaymentRequest {
  orderId: string;
  amount: Money;
  customerEmail: string;
  reference: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface PaymentGateway {
  charge(request: PaymentRequest): Promise<PaymentResult>;
}

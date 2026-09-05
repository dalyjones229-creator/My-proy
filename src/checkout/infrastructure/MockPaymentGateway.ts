import {
  PaymentGateway,
  PaymentRequest,
  PaymentResult,
} from "../domain/ports/PaymentGateway";

export interface MockPaymentConfig {
  failWithProbability?: number;
  latencyMs?: number;
}

export class MockPaymentGateway implements PaymentGateway {
  constructor(private readonly config: MockPaymentConfig = {}) {}

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    const latency = this.config.latencyMs ?? 0;
    if (latency > 0) {
      await new Promise((r) => setTimeout(r, latency));
    }

    const failRate = this.config.failWithProbability ?? 0;
    const shouldFail = Math.random() < failRate;

    if (shouldFail) {
      return {
        success: false,
        transactionId: "",
        message: "Pago rechazado por la pasarela (simulacion).",
      };
    }

    return {
      success: true,
      transactionId: `txn_${request.orderId}_${Date.now()}`,
      message: "Pago aprobado (simulacion).",
    };
  }
}

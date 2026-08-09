import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

/**
 * DEVELOPMENT PAYMENT MODE.
 *
 * Simulates a payment gateway so the full booking flow (select → review →
 * confirm → pay → confirmation) works end-to-end without real money or
 * credentials. It never claims a payment succeeded without the caller
 * explicitly confirming — see `charge()` below — and every booking created
 * through it is clearly marked so no one mistakes it for a live charge.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "MOCK" as const;

  async charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    // Simulate network latency so UI loading states are exercised honestly.
    await new Promise((resolve) => setTimeout(resolve, 400));

    const transactionRef = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      success: true,
      transactionRef,
      status: "SUCCESS",
      message: "DEVELOPMENT PAYMENT MODE — simulated charge, no real money moved.",
    };
  }

  async refund(transactionRef: string): Promise<PaymentChargeResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      success: true,
      transactionRef: `${transactionRef}-REFUND`,
      status: "SUCCESS",
      message: "DEVELOPMENT PAYMENT MODE — simulated refund.",
    };
  }
}

import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

/**
 * eSewa (Nepal) integration scaffold — see khalti-provider.ts for the same
 * rationale. Requires ESEWA_SECRET_KEY and ESEWA_MERCHANT_CODE.
 */
export class EsewaPaymentProvider implements PaymentProvider {
  readonly name = "ESEWA" as const;

  private get secretKey() {
    const key = process.env.ESEWA_SECRET_KEY;
    if (!key) {
      throw new Error(
        "ESEWA_SECRET_KEY is not set. Add it to .env.local, or set PAYMENT_PROVIDER=MOCK for local development."
      );
    }
    return key;
  }

  async charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    void this.secretKey;
    // TODO: Build the eSewa form-post payload (amount, product_code, signature
    // via HMAC-SHA256 with ESEWA_SECRET_KEY) and redirect the user to eSewa's
    // hosted payment page. Verify via the status-check API on callback.
    throw new Error(`eSewa integration is not yet implemented (booking ${request.bookingId}).`);
  }

  async refund(transactionRef: string): Promise<PaymentChargeResult> {
    throw new Error(`eSewa refunds are not yet implemented (transaction ${transactionRef}).`);
  }
}

import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

/**
 * Khalti (Nepal) integration scaffold.
 *
 * Not implemented yet — wiring this up requires a live KHALTI_SECRET_KEY
 * (see .env.example) and a call to Khalti's checkout/verification API,
 * which needs outbound network access this environment doesn't have.
 * The shape mirrors `PaymentProvider` so swapping `MockPaymentProvider` for
 * this class in services/payment/index.ts is the only change needed once
 * credentials are available.
 */
export class KhaltiPaymentProvider implements PaymentProvider {
  readonly name = "KHALTI" as const;

  private get secretKey() {
    const key = process.env.KHALTI_SECRET_KEY;
    if (!key) {
      throw new Error(
        "KHALTI_SECRET_KEY is not set. Add it to .env.local, or set PAYMENT_PROVIDER=MOCK for local development."
      );
    }
    return key;
  }

  async charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    void this.secretKey;
    // TODO: POST to Khalti's "initiate" endpoint with amount (in paisa),
    // return_url, and website_url, then redirect the user to the returned
    // payment_url. Verify via the lookup endpoint on callback.
    throw new Error(`Khalti integration is not yet implemented (booking ${request.bookingId}).`);
  }

  async refund(transactionRef: string): Promise<PaymentChargeResult> {
    throw new Error(`Khalti refunds are not yet implemented (transaction ${transactionRef}).`);
  }
}

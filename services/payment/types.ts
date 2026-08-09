export interface PaymentChargeRequest {
  bookingId: string;
  amount: number; // whole NPR rupees — never trust a client-supplied amount, always recompute server-side
  currency: string;
  description: string;
}

export interface PaymentChargeResult {
  success: boolean;
  transactionRef: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  message?: string;
  /** Where to send the user to complete payment, for redirect-based providers (Khalti/eSewa). Absent in mock mode. */
  redirectUrl?: string;
}

export interface PaymentProvider {
  readonly name: "MOCK" | "KHALTI" | "ESEWA";
  charge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
  refund(transactionRef: string, amount: number): Promise<PaymentChargeResult>;
}

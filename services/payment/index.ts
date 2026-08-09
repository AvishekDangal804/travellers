import { MockPaymentProvider } from "./mock-provider";
import { KhaltiPaymentProvider } from "./khalti-provider";
import { EsewaPaymentProvider } from "./esewa-provider";
import type { PaymentProvider } from "./types";

export type { PaymentProvider, PaymentChargeRequest, PaymentChargeResult } from "./types";

let cached: PaymentProvider | null = null;

/** Resolves the active PaymentProvider from PAYMENT_PROVIDER (defaults to MOCK for local dev). */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;

  const configured = (process.env.PAYMENT_PROVIDER ?? "MOCK").toUpperCase();

  switch (configured) {
    case "KHALTI":
      cached = new KhaltiPaymentProvider();
      break;
    case "ESEWA":
      cached = new EsewaPaymentProvider();
      break;
    default:
      cached = new MockPaymentProvider();
  }

  return cached;
}

export const isDevelopmentPaymentMode = () => getPaymentProvider().name === "MOCK";

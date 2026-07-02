import Stripe from 'stripe';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';

// ============================================================================
// Stripe payments (lazy-initialized from env.STRIPE_SECRET_KEY).
// Legacy `Product.makeApayment` used the deprecated `stripe.charges.create`
// with a raw card token. We expose:
//   * createPaymentIntent() — the modern, SCA-ready flow (recommended)
//   * chargeCard()          — legacy-parity charge for drop-in compatibility
// ============================================================================

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(501, 'Stripe is not configured (STRIPE_SECRET_KEY missing)');
  }
  if (!stripe) stripe = new Stripe(env.STRIPE_SECRET_KEY);
  return stripe;
}

export interface PaymentIntentParams {
  amount: number; // smallest currency unit (e.g. cents)
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  paymentMethod?: string; // pm_... — when provided with confirm, charges immediately
  confirm?: boolean;
}

export async function createPaymentIntent(params: PaymentIntentParams): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.create({
    amount: Math.round(params.amount),
    currency: params.currency.toLowerCase(),
    description: params.description,
    metadata: params.metadata,
    payment_method: params.paymentMethod,
    confirm: params.confirm ?? false,
    automatic_payment_methods: params.paymentMethod ? undefined : { enabled: true, allow_redirects: 'never' },
  });
}

export interface ChargeParams {
  amount: number; // smallest currency unit
  currency: string;
  token: string; // legacy card/source token (tok_... / src_...)
  description?: string;
  metadata?: Record<string, string>;
}

/** Legacy-parity charge. Prefer createPaymentIntent for new integrations. */
export async function chargeCard(params: ChargeParams): Promise<Stripe.Charge> {
  return getStripe().charges.create({
    amount: Math.round(params.amount),
    currency: params.currency.toLowerCase(),
    source: params.token,
    description: params.description,
    metadata: params.metadata,
  });
}

/** Refund a charge or payment intent (used by booking cancellation). */
export async function refund(chargeOrPaymentIntentId: string): Promise<Stripe.Refund> {
  const s = getStripe();
  if (chargeOrPaymentIntentId.startsWith('pi_')) {
    return s.refunds.create({ payment_intent: chargeOrPaymentIntentId });
  }
  return s.refunds.create({ charge: chargeOrPaymentIntentId });
}

export const isStripeEnabled = (): boolean => Boolean(env.STRIPE_SECRET_KEY);

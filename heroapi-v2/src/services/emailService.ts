import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';

// ============================================================================
// Transactional email (nodemailer, lazy-initialized from SMTP_* env).
// Replaces the legacy hardcoded Gmail credentials. All templates share a
// minimal Hero Explorer branded wrapper.
// ============================================================================

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    throw new HttpError(501, 'Email is not configured (SMTP_HOST / SMTP_USER missing)');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_SECURE ?? false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  await getTransporter().sendMail({
    from: opts.from ?? env.MAIL_FROM,
    to: Array.isArray(opts.to) ? opts.to.join(',') : opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export const isEmailEnabled = (): boolean => Boolean(env.SMTP_HOST && env.SMTP_USER);

// ── Branded wrapper ───────────────────────────
const wrap = (body: string): string => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
    <div style="padding:24px 0;text-align:center;border-bottom:2px solid #f0f0f0">
      <h1 style="margin:0;font-size:22px;color:#0b4f6c">Hero Explorer</h1>
    </div>
    <div style="padding:24px 8px;font-size:15px;line-height:1.6">${body}</div>
    <div style="padding:16px 8px;border-top:1px solid #f0f0f0;font-size:12px;color:#888;text-align:center">
      © Hero Explorer — <a href="${env.APP_PUBLIC_URL}" style="color:#0b4f6c">heroexplorer.com</a>
    </div>
  </div>`;

// ── Templates ─────────────────────────────────
export const verificationEmailHtml = (email: string, code: number | string): string =>
  wrap(`
    <p>Welcome to Hero Explorer!</p>
    <p>Please verify your email address using the code below:</p>
    <p style="font-size:26px;font-weight:bold;letter-spacing:4px;color:#0b4f6c">${code}</p>
    <p>Or click: <a href="${env.APP_PUBLIC_URL}/verify/${encodeURIComponent(email)}/${code}">Verify my email</a></p>
  `);

export const adminNewUserHtml = (user: { email: string; firstname?: string | null; lastname?: string | null }): string =>
  wrap(`
    <p><strong>New user sign up!</strong></p>
    <p>Name: ${user.firstname ?? ''} ${user.lastname ?? ''}</p>
    <p>Email: ${user.email}</p>
  `);

export const forgotPasswordHtml = (code: number | string): string =>
  wrap(`
    <p>You requested a password reset.</p>
    <p>Your reset code is:</p>
    <p style="font-size:26px;font-weight:bold;letter-spacing:4px;color:#0b4f6c">${code}</p>
    <p>Reset here: <a href="${env.APP_PUBLIC_URL}/reset-password">${env.APP_PUBLIC_URL}/reset-password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `);

export const bookingConfirmationHtml = (b: {
  name?: string | null;
  productTitle?: string | null;
  itineraryId: string;
  travelDate?: Date | string | null;
  chargedPrice?: number | string | null;
  currency?: string | null;
}): string =>
  wrap(`
    <p>Hi ${b.name ?? 'traveller'},</p>
    <p>Your booking is <strong>confirmed</strong>. 🎉</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:6px 0;color:#666">Tour</td><td style="text-align:right">${b.productTitle ?? ''}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Itinerary</td><td style="text-align:right">${b.itineraryId}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Travel date</td><td style="text-align:right">${b.travelDate ?? 'TBC'}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Total</td><td style="text-align:right">${b.currency ?? ''} ${b.chargedPrice ?? ''}</td></tr>
    </table>
    <p>Thank you for booking with Hero Explorer!</p>
  `);

export const requestEditHtml = (params: {
  firstname?: string | null;
  lastname?: string | null;
  email: string;
  itineraryId: string;
  title: string;
  content: string;
}): string =>
  wrap(`
    <p><strong>Booking change request</strong></p>
    <p>From: ${params.firstname ?? ''} ${params.lastname ?? ''} (${params.email})</p>
    <p>Itinerary: ${params.itineraryId}</p>
    <p>Type: ${params.title}</p>
    <p>Message:</p>
    <blockquote style="border-left:3px solid #0b4f6c;padding-left:12px;color:#444">${params.content}</blockquote>
  `);

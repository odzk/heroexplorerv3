import 'dotenv/config';
import { z } from 'zod';

// ============================================================================
// Environment configuration — validated once at boot.
// Integration secrets (Stripe, SMTP, AWS, DigitalOcean, Redis) are OPTIONAL so
// the API boots in development without every third-party configured. The
// corresponding service throws a clear error only if it is actually used
// without configuration.
// ============================================================================

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database (required)
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required (PostgreSQL connection string)')
    .default('postgresql://postgres:postgres@localhost:5432/heroexplorer?schema=public'),

  // Auth
  JWT_SECRET: z.string().min(1).default('dev_secret_change_me'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Viator Partner API
  VIATOR_API_KEY: z.string().default(''),
  VIATOR_API_URL: z.string().default('https://api.sandbox.viator.com/partner'),
  VIATOR_CURRENCY: z.string().default('AUD'),

  // Redis (optional cache)
  REDIS_URL: z.string().optional(),

  // Stripe (optional — required only for /payments + booking checkout)
  STRIPE_SECRET_KEY: z.string().optional(),

  // Email / SMTP (optional — required only for the email flows)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  MAIL_FROM: z.string().default('Hero Explorer <hello@heroexplorer.com>'),
  ADMIN_NOTIFY_EMAILS: z.string().default('hello@heroexplorer.com'),
  APP_PUBLIC_URL: z.string().default('https://www.heroexplorer.com'),

  // AWS S3 (optional — required only for logo upload)
  AWS_REGION: z.string().default('ap-southeast-2'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().default('heroexplorer'),
  AWS_S3_PREFIX: z.string().default('logo'),

  // DigitalOcean DNS (optional — required only for subdomain provisioning)
  DIGITALOCEAN_TOKEN: z.string().optional(),
  DIGITALOCEAN_API_URL: z.string().default('https://api.digitalocean.com/v2/'),
  ROOT_DOMAIN: z.string().default('heroexplorer.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:\n', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export type Env = typeof env;

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

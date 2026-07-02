import axios from 'axios';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';

// ============================================================================
// DigitalOcean DNS — subdomain provisioning.
// Replaces the legacy `Customization.addDomainAws` (misnamed; it actually hit
// the DigitalOcean API with a hardcoded Bearer token). Creates a CNAME record
// pointing <subdomain>.<ROOT_DOMAIN> -> <ROOT_DOMAIN>.
//
// ⚠️ This performs an IRREVERSIBLE external DNS mutation. The route that calls
// it is admin-gated. Callers should confirm intent before invoking.
// ============================================================================

export interface DnsRecord {
  id: number;
  type: string;
  name: string;
  data: string;
  ttl: number;
}

export async function createSubdomainCname(subdomain: string): Promise<DnsRecord> {
  if (!env.DIGITALOCEAN_TOKEN) {
    throw new HttpError(501, 'DigitalOcean DNS is not configured (DIGITALOCEAN_TOKEN missing)');
  }

  const url = `${env.DIGITALOCEAN_API_URL}domains/${env.ROOT_DOMAIN}/records`;

  try {
    const { data } = await axios.post(
      url,
      { type: 'CNAME', name: subdomain, data: `${env.ROOT_DOMAIN}.`, ttl: 1800 },
      { headers: { Authorization: `Bearer ${env.DIGITALOCEAN_TOKEN}`, 'Content-Type': 'application/json' } },
    );
    return (data as { domain_record: DnsRecord }).domain_record;
  } catch (error) {
    const anyErr = error as { response?: { status?: number; data?: unknown } };
    throw new HttpError(anyErr?.response?.status ?? 502, 'Failed to create DNS record', anyErr?.response?.data);
  }
}

export const isDnsEnabled = (): boolean => Boolean(env.DIGITALOCEAN_TOKEN);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiFetch } from '../utils/index.js';
import { Listing, User } from '../types/index.js';

export async function fetchAllListings(): Promise<Listing[]> {
  const res = await apiFetch('/api/listings');
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

export async function upgradeSaaSPlan(plan: string, phone: string): Promise<any> {
  const res = await apiFetch('/api/saas/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, phone })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to upgrade subscription plan');
  }
  return res.json();
}

export async function generateAIEnhancement(id: string): Promise<string> {
  const res = await apiFetch(`/api/merchant/enhance-seo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  const data = await res.json();
  return data.enhancedDescription || '';
}

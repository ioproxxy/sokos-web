/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from '../../config/index.js';
import { logger } from '../../utils/index.js';

export function formatMpesaPhoneNumber(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '254' + clean.substring(1);
  } else if (clean.startsWith('+')) {
    clean = clean.replace('+', '');
  } else if (clean.length === 9) {
    clean = '254' + clean;
  }
  return clean;
}

export async function getMpesaAccessToken(): Promise<string> {
  const { consumerKey, consumerSecret, env } = config.mpesa;
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa Consumer Keys are missing in config.');
  }

  const host = env === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
  const url = `https://${host}/oauth/v1/generate?grant_type=client_credentials`;
  const base64Creds = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${base64Creds}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`STK Push OAuth request status rejected: ${res.status}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function triggerStkPush(phone: string, amount: number, orderId: string): Promise<any> {
  const { shortcode, passkey, env, callbackUrl } = config.mpesa;
  const token = await getMpesaAccessToken();
  const host = env === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
  const url = `https://${host}/mpesa/stkpush/v1/processrequest`;

  const now = new Date();
  const timestamp = now.toISOString().replace(/[-T:Z.]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const formattedPhone = formatMpesaPhoneNumber(phone);
  const cleanOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: cleanOrderId || 'SokoSaaS',
    TransactionDesc: `Soko Payment Ref ${cleanOrderId}`
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    logger.error(`Daraja Push transaction error: ${txt}`);
    throw new Error(`Safaricom response error: ${txt}`);
  }

  return await res.json();
}

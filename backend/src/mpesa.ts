/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Clean and format mobile phone numbers to the required Safaricom format: 2547XXXXXXXX or 2541XXXXXXXX
 */
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

/**
 * Determine the correct M-Pesa API domain based on environment preference
 */
function getMpesaHost(): string {
  const isProduction = process.env.MPESA_ENV === 'production';
  return isProduction ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
}

/**
 * Fetch OAuth access token from Safaricom Daraja API
 */
export async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured (MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are required).');
  }

  const host = getMpesaHost();
  const oauthUrl = `https://${host}/oauth/v1/generate?grant_type=client_credentials`;
  const base64Credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await fetch(oauthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Safaricom OAuth service failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json() as { access_token: string; expires_in: string };
    if (!data.access_token) {
      throw new Error('Safaricom did not return a valid access token in JSON body.');
    }

    return data.access_token;
  } catch (error: any) {
    console.error('Error fetching M-Pesa access token from Daraja:', error);
    throw error;
  }
}

export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  orderId: string;
}

export interface StkPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/**
 * Trigger physical Lipa Na M-Pesa Online STK Push Prompt on Subscriber handset
 */
export async function triggerStkPush(params: StkPushParams): Promise<StkPushResult> {
  const host = getMpesaHost();
  const url = `https://${host}/mpesa/stkpush/v1/processrequest`;

  // Fetch valid access token
  const token = await getMpesaAccessToken();

  // Load configured keys or fallbacks (Safaricom sandbox defaults)
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const callbackUrl = process.env.MPESA_CALLBACK_URL || `${appUrl}/api/mpesa/callback`;
  const transactionType = process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline'; // or CustomerBuyGoodsOnline

  // Generate Timestamp: YYYYMMDDHHmmss (standard 14 digit representation)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hour}${minute}${second}`;

  // Generate Password: Base64(ShortCode + PassKey + Timestamp)
  const passwordSource = `${shortcode}${passkey}${timestamp}`;
  const password = Buffer.from(passwordSource).toString('base64');

  const formattedPhone = formatMpesaPhoneNumber(params.phoneNumber);
  
  // Safe alphanumeric account reference for Daraja (max 12 characters, no special chars)
  const safeAccountRef = params.orderId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: Math.round(params.amount),
    PartyA: formattedPhone,
    PartyB: shortcode, // In Paybill setup, PartyB matches the business shortcode
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: safeAccountRef || 'SokosOrder',
    TransactionDesc: `Soko Listing Order Payment ${safeAccountRef}`
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Daraja push execution failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json() as StkPushResult;
    return data;
  } catch (err: any) {
    console.error('Error pushing physical STK payment prompt via Safaricom:', err);
    throw err;
  }
}

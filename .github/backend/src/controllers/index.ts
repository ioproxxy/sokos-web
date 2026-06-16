/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { UserModel, OrderModel, ListingModel } from '../models/index.js';
import { triggerStkPush } from '../services/mpesa/index.js';
import { logger } from '../utils/index.js';

export class PaymentController {
  public static async executeMpesaCheckout(req: Request, res: Response) {
    const { orderId, phone, amount } = req.body;
    if (!orderId || !phone || !amount) {
      return res.status(400).json({ error: 'orderId, phone, and amount are required fields.' });
    }

    try {
      logger.info(`Initiating checkout request for Order ${orderId}, Phone ${phone}, Amount ${amount}`);
      const darajaResult = await triggerStkPush(phone, parseFloat(amount), orderId);

      // Update order status with CheckoutRequestID dynamically
      await OrderModel.update(orderId, {
        status: 'mpesa_pending',
        mpesaCheckoutRequestId: darajaResult.CheckoutRequestID,
        mpesaPhone: phone
      });

      res.json({
        success: true,
        message: 'Lipa Na M-Pesa STK Push prompted successfully.',
        checkoutRequestId: darajaResult.CheckoutRequestID,
        resultCode: darajaResult.ResponseCode
      });
    } catch (err: any) {
      logger.error('Failed to dispatch Lipa Na M-Pesa push prompt', err);
      res.status(500).json({ error: 'M-Pesa execution failed', details: err.message });
    }
  }
}

export class SaaSController {
  public static async purchaseSaaSSubscription(req: Request, res: Response) {
    const userId = (req as any).userId;
    const { plan, phone } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized vendor session' });
    }
    if (!plan || !['bronze', 'silver', 'gold'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid SaaS plan selection' });
    }

    const priceMap: Record<string, number> = { bronze: 499, silver: 1299, gold: 2499 };
    const price = priceMap[plan];

    try {
      logger.info(`Vendor ${userId} requested SaaS package ${plan} via phone ${phone}`);
      // Dispatch STK Push to vendor phone
      const orderId = `saas_sub_${Date.now()}`;
      await triggerStkPush(phone || '0712345678', price, orderId);

      // Set user subscription state
      await UserModel.update(userId, {
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        premiumBoostQuota: plan === 'gold' ? 10 : (plan === 'silver' ? 4 : 1)
      });

      res.json({
        success: true,
        message: `Package ${plan} purchased successfully. Active 30-day licensing keys bound to vendor.`,
        plan
      });
    } catch (err: any) {
      logger.error('SaaS subscription billing failure', err);
      res.status(500).json({ error: 'Billing setup rejection', details: err.message });
    }
  }
}

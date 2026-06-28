/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { PaymentController, SaaSController } from '../controllers/index.js';
import googleAuthRouter from '../auth/google.js';

const router = Router();

// Liveness healthcheck
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sokos Relational SaaS Backend' });
});

// Google OAuth
router.use('/auth/google', googleAuthRouter);

// Lipa Na M-Pesa STK Push
router.post('/payments/mpesa-push', PaymentController.executeMpesaCheckout);

// SaaS Multitenant Subscription Plan Purchases
router.post('/saas/subscribe', SaaSController.purchaseSaaSSubscription);

export default router;

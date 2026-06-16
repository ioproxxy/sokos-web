/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { PaymentController, SaaSController } from '../controllers/index.js';

const router = Router();

// Liveness healthcheck
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sokos Relational SaaS Backend' });
});

// Lipa Na M-Pesa STK Push
router.post('/payments/mpesa-push', PaymentController.executeMpesaCheckout);

// SaaS Multitenant Subscription Plan Purchases
router.post('/saas/subscribe', SaaSController.purchaseSaaSSubscription);

export default router;

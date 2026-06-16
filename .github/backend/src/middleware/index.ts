/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/index.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} ${req.url} - IP ${req.ip}`);
  next();
}

export function authNegotiator(req: Request, res: Response, next: NextFunction) {
  // Extract custom active user context from request headers or cookies safely
  const headerId = req.headers['x-soko-user-id'];
  let activeUserId = '';

  if (headerId && typeof headerId === 'string' && headerId.trim()) {
    activeUserId = headerId.trim();
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name === 'soko_user_id') {
        const val = valueParts.join('=');
        if (val && val.trim()) {
          activeUserId = val.trim();
          break;
        }
      }
    }
  }

  // Bind directly into Express Request object
  (req as any).userId = activeUserId;
  next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`Critical request failure caught within Express middleware: ${err.message}`, err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
}

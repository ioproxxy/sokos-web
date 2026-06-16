/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from '../../config/index.js';
import { logger } from '../../utils/index.js';

/**
 * High-fidelity production wrapper for real Telegram Bot alerts over orders and SaaS subscriptions
 */
export async function sendTelegramNotification(message: string): Promise<boolean> {
  const { botToken, chatId } = config.telegram;
  if (!botToken || !chatId) {
    logger.info(`[Telegram Service] Bot tokens unconfigured. Message muted: ${message}`);
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (res.ok) {
      logger.info(`[Telegram Service] Alert dispatched successfully to Chat ${chatId}`);
      return true;
    } else {
      logger.error(`[Telegram Service] API error: ${res.status} ${await res.text()}`);
      return false;
    }
  } catch (err) {
    logger.error('[Telegram Service] Failed to execute sendMessage webhook', err);
    return false;
  }
}

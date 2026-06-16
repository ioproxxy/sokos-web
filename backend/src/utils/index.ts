/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

export const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, ...args),
};

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function safeParseJson<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

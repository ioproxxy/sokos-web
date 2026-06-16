/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from 'pg';
import { config } from '../config/index.js';

let pool: pg.Pool | null = null;

export function getDatabasePool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
      });
    } else {
      // Return a mock/empty pool or fallback representation for local development
      pool = new pg.Pool({});
    }
  }
  return pool;
}

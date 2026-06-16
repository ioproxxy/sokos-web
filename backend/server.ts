/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './src/config/index.js';
import { requestLogger, authNegotiator, errorHandler } from './src/middleware/index.js';
import apiRouter from './src/routes/index.js';

async function startServer() {
  const app = express();
  const PORT = config.port;

  // Basic Middlewares
  app.use(express.json());
  app.use(requestLogger);
  app.use(authNegotiator);

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Serve static assets or mount Vite dev middleware
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Common error handling middleware
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sokos Enterprise] Server successfully bound to port ${PORT} in ${config.nodeEnv} state.`);
  });
}

startServer().catch(err => {
  console.error('[Sokos Enterprise] Server boot crash captured:', err);
});

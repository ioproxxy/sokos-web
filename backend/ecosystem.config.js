/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  apps: [
    {
      name: 'sokos-backend',
      script: 'dist/server.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};

import { defineConfig } from 'vite';
import { estamperVitePlugin } from '../../dist/vite/index.js';

export default defineConfig({
  plugins: [
    estamperVitePlugin({
      config: '../../estamper.config.yml',
      inject: true,
      meta: true,
    }),
  ],
});

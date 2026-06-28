import { defineConfig } from 'vite';
import { stampogVitePlugin } from '../../dist/vite/index.js';

export default defineConfig({
  plugins: [
    stampogVitePlugin({
      config: '../../stampog.config.yml',
      inject: true,
      meta: true,
    }),
  ],
});

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://estamper.dev',
  outDir: './site-dist',
  integrations: [
    starlight({
      title: 'Estamper',
      description: 'Know exactly which deploy is on screen.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/roktiw/estamper-priv' }],
      sidebar: [
        {
          label: '📖 Getting Started',
          items: [
            { label: 'Installation', link: '/docs/getting-started/' },
            { label: 'Quick Start', link: '/docs/getting-started/#quick-start' },
            { label: 'Init config', link: '/docs/getting-started/#init-config' },
          ],
        },
        {
          label: '⚙️ Configuration',
          items: [
            { label: 'estamper.config.yml', link: '/docs/config/' },
            { label: 'Presets', link: '/docs/presets/' },
          ],
        },
        {
          label: '🏷️ Stamp Format',
          items: [
            { label: 'Segments', link: '/docs/stamp-format/' },
            { label: 'Emoji tokens', link: '/docs/emoji-mode/' },
            { label: 'ASCII tokens', link: '/docs/ascii-mode/' },
          ],
        },
        {
          label: '💻 CLI',
          items: [{ label: 'Commands', link: '/docs/cli/' }],
        },
        {
          label: '🌐 Browser Badge',
          items: [{ label: 'mountEstamper()', link: '/docs/browser-badge/' }],
        },
        {
          label: '⚡ Integrations',
          items: [
            { label: 'GitHub Actions', link: '/docs/github-actions/' },
            { label: 'Vite plugin', link: '/docs/vite-plugin/' },
          ],
        },
        {
          label: '🔌 API Reference',
          items: [{ label: 'API', link: '/docs/api/' }],
        },
      ],
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});

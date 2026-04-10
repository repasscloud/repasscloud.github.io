// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://repasscloud.com',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  vite: {
    server: {
      watch: {
        // Exclude Hugo theme directory — it contains a circular symlink
        // (themes/gokarna/exampleSite/themes → ...) that causes ELOOP
        ignored: ['**/themes/**'],
      },
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Atkinson Hyperlegible',
      cssVariable: '--font-atkinson',
      fallbacks: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    },
  ],
});

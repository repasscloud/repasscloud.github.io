// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://repasscloud.com',
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({
      // Legacy /posts and /projects routes are kept as thin redirect/alias
      // pages for URL compatibility (see /news and /archive), and must not
      // be treated as canonical, indexable content in the sitemap.
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.startsWith('/posts') && !path.startsWith('/projects');
      },
    }),
  ],
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

// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://repasscloud.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [
    mdx(),
    sitemap({
      // Legacy URLs are 301s in public/_redirects, so every built page is
      // canonical. Keep error pages out of the sitemap.
      filter: (page) => !new URL(page).pathname.startsWith('/404'),
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
      name: 'Schibsted Grotesk',
      cssVariable: '--font-sans',
      weights: ['400 800'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});

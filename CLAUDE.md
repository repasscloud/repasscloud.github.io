# CLAUDE.md

## Repository Context

This repository contains the source code for the public RePass Cloud website at `https://repasscloud.com`.

The current active site is an Astro static site. Some legacy Hugo files still exist in the repository, including `hugo.toml`, `layouts/`, `content/`, `static/`, `themes/`, and the Gokarna theme submodule. Treat those as legacy unless the task explicitly asks for Hugo migration or cleanup.

Primary stack:

- Astro 6
- TypeScript / Astro components
- MD / MDX content collections
- GitHub Pages deployment
- GitHub Actions build pipeline
- Tectonic for compiling `.tex` files into PDFs before the Astro build

## Operating Rule

Maintain the live Astro site. Do not convert the project back to Hugo. Do not assume Hugo files are active source-of-truth unless specifically asked.

When changing the site, prefer small, reviewable updates and preserve the current positioning: enterprise software, cloud automation, Microsoft 365 identity automation, PowerShell delivery, and product links for Cinturon360 and Aethon.

## Important Files

### Site configuration

- `package.json`
  - Node project metadata.
  - Requires Node `>=22.12.0`.
  - Main scripts:
    - `npm run dev`
    - `npm run build`
    - `npm run preview`

- `astro.config.mjs`
  - Astro config.
  - `site` is `https://repasscloud.com`.
  - Uses `@astrojs/mdx` and `@astrojs/sitemap`.
  - Uses Google font provider for Atkinson Hyperlegible.
  - Ignores `themes/**` for Vite file watching because the old Hugo theme has circular symlink behaviour.

- `src/consts.ts`
  - Global constants for site title, description, domains, product links, GitHub, LinkedIn, Twitter, GTM, GA, and default Open Graph image.
  - Update repeated brand URLs here rather than scattering hard-coded links.

### Layouts and global page shell

- `src/layouts/Layout.astro`
  - Main HTML document wrapper.
  - Imports `BaseHead`, `Header`, `Footer`, and `CookieConsent`.
  - Handles Google Tag Manager `<noscript>` when `GTM_CONTAINER_ID` starts with `GTM-`.
  - Adds the standard header, page slot, footer, and cookie consent banner.

- `src/components/BaseHead.astro`
  - Imports global CSS from `src/styles/revamp.css`.
  - Owns canonical URLs, page titles, meta descriptions, robots tags, Open Graph tags, Twitter cards, RSS link, sitemap link, GA/GTM scripts, and default analytics consent state.
  - Use this for SEO/head changes rather than duplicating head markup in pages.

- `src/layouts/PostLayout.astro`
  - Standard blog/article layout.
  - Adds `BlogPosting` schema.
  - Passes article metadata to `Layout`.
  - Renders tags, publication date, update date, optional hero image, and post body.

### Navigation and footer

- `src/components/Header.astro`
  - Main navigation and mobile menu script.
  - Current top-level nav links:
    - Services
    - Case Studies
    - Work
    - Posts
    - Careers
  - CTA links to `/about` and `/contact`.
  - If adding new top-level pages, update `navLinks` here and confirm active link behaviour.

- `src/components/Footer.astro`
  - Footer columns, social links, product links, legal links, cookie controls, and privacy choices button.
  - Product links are imported from `src/consts.ts`.
  - Cookie/privacy buttons call `window.repasscloudOpenCookieBanner()`.

### Content collections and posts

- `src/content.config.ts`
  - Defines the `posts` content collection.
  - Posts are loaded from `src/content/posts/**/*.{md,mdx}`.
  - Required front matter:
    - `title: string`
    - `description: string`
    - `pubDate: date`
  - Optional front matter:
    - `updatedDate: date`
    - `heroImage: image`
    - `tags: string[]`

- `src/pages/posts/[...slug].astro`
  - Generates static routes for every post in the `posts` collection.
  - Uses `render(post)` and `PostLayout`.

- `src/pages/rss.xml.js`
  - Generates the RSS feed from the posts collection.
  - Sorts posts by `pubDate` descending.

### Homepage

- `src/pages/index.astro`
  - Main homepage.
  - Pulls recent posts from the `posts` collection.
  - Defines homepage capability cards and case study cards inline.
  - Adds Organization schema JSON-LD.
  - Product spotlights link to Cinturon360 and Aethon via constants.

### Styles

- `src/styles/revamp.css`
  - Global styling system for the current site.
  - Use existing class patterns before introducing new CSS.
  - Prefer reusable utility/card/grid classes already present in the file.

### Automation and deployment

- `.github/workflows/astro-build.yml`
  - Runs on push to `dev` and manual workflow dispatch.
  - Detects npm/yarn.
  - Sets up Node `25` in CI.
  - Installs dependencies.
  - Runs `npm audit`.
  - Installs Tectonic.
  - Compiles `.tex` files under `latex/` into `static/`.
  - Runs Astro build.
  - Creates and merges a PR from `dev` to `main` if the build succeeds.

- `script/submit2-indexnow.sh`
  - Submits URLs from the generated sitemap to IndexNow.
  - Requires `INDEXNOW_KEY`.
  - Supports sitemap index recursion and batching.

- `script/submit2-google.py` and `script/submit2-bing.py`
  - Sitemap submission helpers.
  - These currently use simple request-based ping style submission.

- `deploy.sh`
  - Legacy/local deployment script from the Hugo era.
  - It runs `hugo`, so do not use it for normal Astro deployment unless it is intentionally rewritten.

## Local Development Commands

Use these commands from the repository root:

```bash
npm ci
npm run dev
```

Build locally:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

Run Astro directly when needed:

```bash
npx astro check
npx astro build
```

If `astro check` is not available, inspect dependencies first. Do not add packages unless the task requires it.

## Branching and Deployment Workflow

Preferred workflow:

1. Work from `dev` unless instructed otherwise.
2. Make focused changes.
3. Run `npm run build` before committing.
4. Push to `dev`.
5. Let `.github/workflows/astro-build.yml` build and auto-merge to `main`.

Do not push directly to `main` unless explicitly instructed.

## Content Editing Rules

When adding or editing pages/posts:

- Keep the tone direct, technical, and enterprise-focused.
- Avoid hype-heavy marketing language.
- Prefer concrete capabilities, outcomes, proof points, and operational constraints.
- Use Australian English where natural.
- Keep RePass Cloud positioning centred on:
  - enterprise software systems
  - cloud automation and governance
  - Microsoft 365 / Entra ID lifecycle automation
  - PowerShell tooling
  - production-grade internal platforms
  - audit-aware delivery

For blog posts in `src/content/posts/`, always include valid front matter:

```md
---
title: "Clear post title"
description: "Unique SEO description, ideally 120-160 characters."
pubDate: 2026-05-29
tags: ["Astro", "Cloud", "Automation"]
---
```

Use `updatedDate` only when materially revising old content:

```md
updatedDate: 2026-05-29
```

If using a hero image, confirm it is compatible with the content collection image schema.

## SEO Rules

For every page-level change, check:

- Page has a useful title.
- Page has a unique meta description.
- Canonical URL remains correct through `BaseHead.astro`.
- Open Graph image resolves.
- `noIndex` is only used for pages that should not be indexed.
- Internal links use clean site paths, for example `/contact`, `/projects`, `/services/cloud-tooling`.
- External links use `target="_blank"` and `rel="noopener"` where appropriate.

For blog posts:

- Keep `description` unique.
- Keep `pubDate` stable once published.
- Add `updatedDate` for substantial updates.
- Use relevant tags without over-tagging.

## Analytics and Consent Rules

Analytics are handled in `BaseHead.astro` and `CookieConsent.astro`.

Rules:

- Do not bypass the consent default of denied analytics storage.
- Do not add extra analytics scripts directly to pages.
- Update `src/consts.ts` if replacing placeholder GA values.
- Preserve the cookie banner and privacy choices flow.
- Ensure footer cookie buttons still open the consent banner.

## Legal and Privacy Pages

Legal links are exposed in the footer:

- `/legal/privacy-policy`
- `/legal/terms-of-service`
- `/legal/refund-policy`

When editing legal content:

- Do not invent legal obligations.
- Do not remove company identity details unless requested.
- Keep contact paths consistent with the current `/contact` approach.
- Treat legal pages as public-facing production content.

## Legacy Hugo Files

The repository still contains Hugo-era files:

- `hugo.toml`
- `layouts/`
- `content/`
- `static/`
- `themes/`
- `.gitmodules`
- `deploy.sh`

Do not delete these unless the task specifically asks for cleanup. If asked to clean them up, first confirm whether any assets under legacy `static/` are still referenced by the Astro site.

Important: `static/` may still be active in Astro because Astro serves files from `public/` by default, but this repo's workflow also writes generated PDF files into `static/`. Before moving or deleting anything, inspect how the deployed site expects static assets to be served.

## LaTeX / PDF Publishing

The CI workflow compiles `.tex` files from `latex/` into matching paths under `static/` using Tectonic.

When working on PDFs:

- Keep `.tex` source under `latex/`.
- Let CI generate PDFs unless a local generated PDF is explicitly required.
- If changing output paths, update links in Astro pages and the GitHub Actions workflow together.
- Run a local Tectonic build if Tectonic is installed.

## Code Style

General rules:

- Keep Astro components small and readable.
- Prefer constants and arrays for repeated card/list content.
- Do not duplicate header/footer/head logic in individual pages.
- Use semantic HTML.
- Preserve accessibility attributes on nav/menu/buttons.
- Preserve keyboard handling for mobile navigation.
- Avoid adding client-side JavaScript unless needed.
- Prefer Astro server-rendered/static content over hydrated components.

Formatting:

- Use two-space indentation in `.astro`, `.ts`, `.js`, `.json`, and YAML files unless the file already uses another clear style.
- Keep imports ordered by local convention.
- Avoid large unrelated rewrites.
- Do not reformat entire files when making small content edits.

## Accessibility Checks

Before finishing UI changes, check:

- Images have useful `alt` text.
- Buttons have accessible labels where text is not visible.
- Mobile nav can open, close, close on Escape, and close when a link is selected.
- Focus and hover states remain visible.
- Colour contrast remains acceptable.
- Links communicate destination clearly.

## Security and Dependency Rules

- Do not commit secrets.
- Do not hard-code API keys, IndexNow keys, or analytics secrets.
- Use GitHub Actions secrets for secret values.
- Be careful with `set:html`; only use it for trusted static JSON-LD or controlled markup.
- Do not add third-party scripts without a clear reason and consent implications.
- If `npm audit` reports issues, prefer minimal dependency updates and verify the Astro build.

## Common Maintenance Tasks

### Add a new post

1. Create a `.md` or `.mdx` file under `src/content/posts/`.
2. Add required front matter.
3. Write content using normal Markdown.
4. Run `npm run build`.
5. Confirm the post appears in `/posts`, its route renders under `/posts/<slug>/`, and RSS includes it.

### Add a new page

1. Create a new `.astro` file under `src/pages/`.
2. Use `Layout`.
3. Set `title` and `description`.
4. Add any page-specific JSON-LD in the `head` slot only if useful.
5. Add navigation/footer links only when the page should be surfaced globally.
6. Run `npm run build`.

Example:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Page Title" description="Specific SEO description for this page.">
  <section class="page-hero">
    <div class="container-narrow">
      <h1>Page heading</h1>
      <p class="hero-lead">Short page intro.</p>
    </div>
  </section>
</Layout>
```

### Update navigation

1. Edit `src/components/Header.astro`.
2. Update `navLinks`.
3. Confirm active state still works with `currentPath.startsWith(href)`.
4. Check desktop and mobile nav.

### Update global links

1. Prefer `src/consts.ts` for product/social/global URLs.
2. Update footer/header/page references only when they cannot reasonably use constants.
3. Run a search for old URL values.

### Update SEO metadata

1. For global defaults, edit `src/consts.ts` and `src/components/BaseHead.astro`.
2. For page-specific metadata, pass `title` and `description` to `Layout`.
3. For posts, edit front matter.
4. Run `npm run build`.

## Pre-Commit Checklist

Before committing:

```bash
npm ci
npm run build
```

Then inspect:

- No accidental generated build output committed, especially `dist/`.
- No secrets or local `.env` files committed.
- No unrelated Hugo cleanup mixed into Astro content changes.
- No broken internal links introduced.
- No placeholder `YOUR_GA4_MEASUREMENT_ID` changes unless intentionally replacing it.
- No legal/privacy wording changed accidentally.

## Known Issues / Review Items

These are not automatic changes. Raise them as separate tasks unless instructed:

1. `README.md` may still describe Hugo as the active static site generator. Update it to Astro when asked.
2. `deploy.sh` still builds with Hugo. Treat it as legacy or rewrite it for Astro when asked.
3. Legacy Hugo folders remain present. Clean them only after confirming no assets/content are still needed.
4. CI uses Node `25`, while `package.json` allows Node `>=22.12.0`. Consider aligning this to an LTS version if requested.
5. The auto-merge workflow from `dev` to `main` is powerful. Do not alter it casually.

## Response Style for Claude

When working in this repository:

- State what files changed.
- State what commands were run.
- State whether the build passed.
- Flag any skipped validation clearly.
- Keep implementation notes concise.
- Do not ask for confirmation unless the task is genuinely ambiguous or destructive.

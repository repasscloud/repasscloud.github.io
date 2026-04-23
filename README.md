# RePass Cloud Website

Source code for https://repasscloud.com.

This repository is now Astro-only (Hugo has been removed).

## Stack

- Astro 6
- TypeScript
- MD/MDX content collections
- GitHub Actions for build and promotion workflow
- Tectonic for compiling legal PDFs from LaTeX

## Requirements

- Node.js 22.12+ (see `package.json` engines)
- npm

## Local Development

Install dependencies:

```bash
npm ci
```

Start local dev server:

```bash
npm run dev
```

Build production site:

```bash
npm run build
```

Preview production output locally:

```bash
npm run preview
```

## Project Structure

- `src/pages/` route files and page content
- `src/components/` reusable Astro components
- `src/layouts/` page layouts
- `src/content/posts/` blog posts used by Astro content collections
- `src/styles/` site styling
- `public/` static assets copied directly at build time
- `static/` additional static assets including generated legal PDFs
- `latex/downloads/legal/` LaTeX sources for legal PDFs
- `.github/workflows/` CI/CD workflows

## Writing Blog Posts

Posts are loaded from `src/content/posts` via `src/content.config.ts`.

Example frontmatter:

```yaml
---
title: "Post title"
description: "Clear 120-160 character summary for SEO and social previews."
pubDate: 2026-04-23
tags:
   - "tag one"
   - "tag two"
---
```

Guidelines:

- Keep `title` specific and outcome-oriented.
- Keep `description` unique and useful in search snippets.
- Use lowercase tags for consistency.
- Prefer long-form, practical technical posts over short announcements.

## Legal PDFs

Legal documents are authored in LaTeX and compiled with Tectonic in CI.

- Sources: `latex/downloads/legal/*.tex`
- Outputs: `static/downloads/legal/*.pdf`

If compiling locally, install Tectonic and run:

```bash
find ./latex -name "*.tex" | while IFS= read -r tex_file; do
   output_dir="$(dirname "$tex_file")"
   output_dir="${output_dir/#.\/latex/.\/static}"
   mkdir -p "$output_dir"
   tectonic "$tex_file" -o "$output_dir"
done
```

## CI/CD

- Main build/promotion pipeline: `.github/workflows/astro-build.yml`
- Weekly search submission tasks: `.github/workflows/weekly-submission.yml`
- SEO submission scripts in `script/`:
   - `submit2-google.py`
   - `submit2-bing.py`
   - `submit2-indexnow.sh`

## Notes

- Site URL and sitemap integration are configured in `astro.config.mjs`.
- This repo includes generated output directories (`dist/` and legal PDFs) during normal workflow operations.

## License

See `LICENSE`.

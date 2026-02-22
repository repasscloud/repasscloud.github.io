# RePass Cloud Website (repasscloud.com)

Static website source for **RePass Cloud**, built with **Hugo** and deployed via **GitHub Pages**.

- **Website:** <https://repasscloud.com>  
- **Repo:** <https://github.com/repasscloud/repasscloud.github.io>  

## Tech

- Hugo (static site generator)
- Theme: Gokarna (theme submodule)
- GitHub Actions (scheduled tasks + deployments)

## Local development

### Prereqs

- Hugo (extended recommended)
- Git

### Run locally

```bash
hugo server -D
```

Site will be available at:

- <http://localhost:1313>

### Build

```bash
hugo
```

Output is written to `public/` by default.

## Content

Posts live under:

- `content/posts/`

### Front matter conventions

For SEO, each post should include a unique meta description:

```toml
+++
title = "..."
date = 2024-01-01
draft = false
description = "A unique 120–160 character summary used for meta description and social previews."
tags = ["..."]
+++
```

## SEO maintenance

### IndexNow (Bing + other IndexNow consumers)

Script:

- `script/submit2-indexnow.sh`

Run locally:

```bash
INDEXNOW_KEY="YOUR_KEY" bash script/submit2-indexnow.sh
```

Recommended: store `INDEXNOW_KEY` as a GitHub Actions secret and run the script on a schedule.

### Google & Bing submission scripts

Repo contains scheduled submission scripts referenced by workflow:

- `script/submit2-google.py`
- `script/submit2-bing.py`

## GitHub Actions

Example scheduled workflow (weekly):

- `.github/workflows/<your-workflow>.yml`

It can run:

- Google submission
- Bing submission
- IndexNow submission

## Link building (inbound links)

Search consoles may warn about low “high-quality inbound links”. Practical steps:

1. Add official website links to:
   - GitHub profile (organization + personal)
   - LinkedIn company page
   - LinkedIn personal profile
   - Any SaaS/product directories you use

2. Add links from GitHub repositories:
   - Add an “Official website” link in READMEs
   - Pin repositories with a website link on the GitHub org profile

3. Publish link-worthy content:
   - Architecture overview pages
   - Technical deep dives (how-to guides, benchmarks, incident writeups)
   - Release announcements
   - Open source tooling posts

## Profiles / directories to update

- RePass Cloud site: <https://repasscloud.com>
- GitHub org profile: <https://github.com/repasscloud>
- LinkedIn company page: <https://www.linkedin.com/company/repass-cloud>
- LinkedIn personal profile: <https://www.linkedin.com/in/djwynyard/>
- Product directories: <https://repasscloud.com/projects/>

## License

If you want a license, add `LICENSE` (MIT/Apache/etc) and update this section.

# RePass Cloud Website Improvement Plan

> **Source:** External review of repasscloud.com  
> **Project:** `repasscloud.github.io` (Astro static site)  
> **Generated:** 2026-07-22

---

## Executive Summary

The site demonstrates strong enterprise positioning and credible writing, but suffers from a disconnect between what RePass Cloud says it does and what a prospective client can immediately hire it for. This plan addresses 7 priority areas across content, structure, UX, and SEO. Each item includes the specific file(s) to modify and the concrete change required.

---

## Priority 1: Critical — Add Engagement Types ("What do I hire you for this month?")

**Problem:** The homepage lists four service lines and two products, but there is no clear path from "I have this pain" to "here is what RePass Cloud will do and what it costs." A CTO needs to know within 10 seconds what specific problem is solved and what engagement looks like.

**Action:** Insert a new "Engagements" section on the homepage (`src/pages/index.astro`) immediately below the hero or positioning section. Frame capabilities as buyable engagement types with scope and typical duration.

**New section to add:**

| Engagement Type | When to use it | Typical scope |
|-----------------|----------------|---------------|
| Automation Audit | You have manual processes, fragile scripts, or pipeline drift | 2–3 week assessment, delivered roadmap |
| Identity Lifecycle Build | M365/Entra ID onboarding/offboarding is broken or non-existent | 4–8 week implementation |
| Cloud Governance Tooling | You need FinOps, cost visibility, or compliance automation across Azure/AWS | Custom, typically 6–12 weeks |
| Embedded Platform Engineering | You need a senior automation engineer embedded in your team | Monthly retainer |

**Files:**
- `src/pages/index.astro` — add section after hero or positioning block (~line 118)
- `src/pages/services/index.astro` (if exists) or create it — deep-dive page for engagement details

---

## Priority 2: High — Rewrite Case Studies with Specificity

**Problem:** The three case studies read as anonymized summaries. Australian enterprise buyers are skeptical of vague claims.

**Current vague claims to fix:**
- "2,100 staff supported with zero daily manual IT intervention" — missing: industry, before-state, buyer title
- "Eliminated a 4 FTE manual burden" — missing: timeframe, systems integrated
- "$7M USD annual spend" — missing: realised savings percentage

**Action:** Add one paragraph to each case study covering:
1. Client industry and rough size (e.g. "Large Australian retail group", "ASX-listed financial services firm")
2. Specific technology stack before engagement
3. Measurable outcome with numbers
4. Paraphrased buyer quote

**Files:**
- `src/pages/index.astro` — `caseStudies` array (~lines 43–68)
- `src/pages/case-studies/index.astro` (if exists) or create it — dedicated case study page with full details

**Content spec for each card:**
```
Label: [Industry tag, e.g. "ASX Retail — 2,000+ staff"]
Title: [Same as now]
Description: [The problem + before-state]
Outcome: [Number + context, e.g. "Zero manual IT intervention for 2,100 staff after 6-week implementation"]
Stack before: [e.g. "Manual AD + ServiceNow tickets"]
Stack after: [e.g. "PowerShell + Entra ID + automated mailbox lifecycle"]
Buyer: [e.g. "IT Operations Manager"]
Quote: [Optional, if available]
Tags: [Same as now]
```

---

## Priority 3: High — Separate Products and Services into Distinct Site Sections

**Problem:** Two products (Cinturon360, Aethon) and four service lines on one homepage split visitor attention. A prospect cannot tell if RePass Cloud is a product company or a services/contracting firm.

**Action:** Clarify the primary business model. If services are the revenue engine and products are side projects:

1. **Homepage (`src/pages/index.astro`)**
   - Services-first layout
   - Reduce product spotlight to a single "Our Products" link in nav or a small footer link
   - Remove the dual product spotlight cards (~lines 195–216)

2. **Create `src/pages/products/index.astro`**
   - Dedicated page for Cinturon360 and Aethon with independent positioning
   - Link from nav as "Products"

3. **Create or expand `src/pages/services/index.astro`**
   - Deep-dive into engagement types, typical deliverables, and process
   - Include the engagement table above
   - Link from nav as "Services"

4. **Navigation update**
   - Update site-wide nav (`src/components/Header.astro` or `src/layouts/Layout.astro`) to: `Services | Products | Case Studies | Posts | Contact`

---

## Priority 4: Critical — Add Clear Services CTA

**Problem:** There is no obvious "Contact us" or "Book a consultation" path beyond the general "Start a conversation" button.

**Action:** Add a persistent, low-friction CTA in the nav and a dedicated section at the bottom of every page.

**New CTA copy:**
> **Book a 30-minute operational review**  
> Tell us about your Azure, M365, or automation challenge. We will identify the highest-leverage fix and whether we are the right team to build it.

**Files:**
- `src/components/Header.astro` or nav component — add persistent "Book a review" button
- `src/pages/index.astro` — update bottom CTA banner (~lines 241–250) with new copy and dual CTA:
  - Primary: "Book a 30-minute operational review"
  - Secondary: "Start a conversation" (existing)
- `src/layouts/Layout.astro` — consider adding CTA to footer or as a floating element

---

## Priority 5: Medium — Publish SEO-Targeted Blog Posts

**Problem:** Current blog posts target broad topics. Australian buyers search for specific pain points.

**Target queries:**
- "Azure DevOps pipeline automation contractor Sydney"
- "Microsoft 365 offboarding automation PowerShell"
- "Entra ID lifecycle management Australia"
- "FinOps tooling Azure AWS multi-cloud"

**Action:** Write and publish three new posts that match these queries exactly:

1. **"How We Automated M365 Offboarding for a 2,000-User Australian Retailer"**
   - Target: "Microsoft 365 offboarding automation PowerShell"
   - Include: stack, timeline, measurable outcome, anonymised client context

2. **"Building a PowerShell Daemon for SSL and Website Monitoring in Azure"**
   - Target: "Azure DevOps pipeline automation contractor Sydney"
   - Include: architecture diagram, code patterns, cost savings

3. **"Azure DevOps vs GitHub Actions: What We Use for Enterprise Automation in 2026"**
   - Target: "Azure DevOps pipeline automation"
   - Include: decision matrix, real client context, recommendation

**Files:**
- `src/content/posts/` — create new `.md` or `.mdx` files
- `src/pages/index.astro` — ensure recent posts section pulls new content

---

## Priority 6: Medium — Add Australian Trust Signals

**Problem:** Australian enterprise buyers are risk-averse. The site lacks signals that RePass Cloud is a safe, local choice.

**Action:** Add the following trust signals across the site:

| Signal | Where | Details |
|--------|-------|---------|
| **Team / Bio section** | `src/pages/about.astro` or new section on homepage | Photo, credentials, "20+ years in automation and .NET engineering" |
| **Australian business details** | Footer (`src/layouts/Layout.astro` or `src/components/Footer.astro`) | ABN/ACN or "Registered in Australia — RePass Cloud Pty Ltd" |
| **Client industry badges** | Case study cards and/or dedicated trust bar | Anonymised: "ASX 200 Retailer", "Australian Superannuation Fund", "Federal Government Agency" |
| **Testimonials** | Homepage and case studies page | 1–2 LinkedIn-style recommendations with names, titles, and company type (anonymised if needed) |

**Files:**
- `src/layouts/Layout.astro` — update footer
- `src/pages/index.astro` — add trust bar above or below case studies
- `src/pages/about.astro` (if exists) or create it
- `src/pages/case-studies/index.astro` — add testimonials

---

## Priority 7: Low — Fix Technical / UX Issues

**Problem:** Minor polish issues that affect perceived credibility.

| Issue | Fix | File |
|-------|-----|------|
| No favicon visible | Verify favicon is present in `public/` and linked in `<head>` | `public/favicon.ico` or `public/favicon.svg`; `src/layouts/Layout.astro` |
| Mobile navigation | Ensure nav collapses cleanly on mobile; test hamburger menu | `src/components/Header.astro` |
| Page speed / Core Web Vitals | Audit with Lighthouse; check for render-blocking scripts or oversized assets | `astro.config.mjs`; build output in `dist/` |

---

## Implementation Checklist

### This Week (Critical + High)
- [ ] Add engagement types table to homepage (`src/pages/index.astro`)
- [ ] Add "Book a 30-minute operational review" CTA to nav and homepage
- [ ] Rewrite `caseStudies` array in `src/pages/index.astro` with industry, stack, and outcome specifics
- [ ] Restructure homepage: services-first, move products to dedicated page
- [ ] Create `src/pages/products/index.astro`
- [ ] Create or expand `src/pages/services/index.astro`
- [ ] Update site nav (`src/components/Header.astro`)

### Next 2 Weeks (Medium)
- [ ] Write and publish 3 SEO-targeted blog posts (`src/content/posts/`)
- [ ] Add team/bio section (`src/pages/about.astro` or homepage)
- [ ] Add Australian business registration details to footer
- [ ] Add anonymised client industry badges to case studies
- [ ] Add 1–2 testimonials

### When Convenient (Low)
- [ ] Verify favicon in `public/` and `<head>`
- [ ] Test mobile navigation collapse
- [ ] Run Lighthouse audit and fix Core Web Vitals issues

---

## Expected Outcome

After implementing this plan, the site should convert from a credibility marker into a client acquisition tool. A CTO or engineering manager visiting repasscloud.com will, within 10 seconds, understand:
1. What specific problem RePass Cloud solves
2. What engagement type fits their situation
3. How to start ("Book a 30-minute operational review")
4. That RePass Cloud is a safe, established, Australian-registered choice

---

## File Map for Reference

| File | Role |
|------|------|
| `src/pages/index.astro` | Homepage — primary target for all content changes |
| `src/layouts/Layout.astro` | Site shell — footer, favicon, global nav wrapper |
| `src/components/Header.astro` | Navigation — CTA button, mobile menu |
| `src/components/Footer.astro` | Footer — business details, links |
| `src/content/posts/` | Blog posts — new SEO-targeted content |
| `src/pages/case-studies/index.astro` | Case studies deep-dive page |
| `src/pages/services/index.astro` | Services deep-dive page (create if missing) |
| `src/pages/products/index.astro` | Products page (create) |
| `src/pages/about.astro` | About / team page (create if missing) |
| `public/favicon.ico` / `favicon.svg` | Favicon assets |
| `astro.config.mjs` | Build config — for speed/performance tweaks |

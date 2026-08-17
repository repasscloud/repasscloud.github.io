# Claude Code Prompt — RePass Cloud Website Repositioning, Product Architecture, UX and SEO Overhaul

## Mission

Take full ownership of the RePass Cloud public website repository:

- Repository: `https://github.com/repasscloud/repasscloud.github.io`
- Live site: `https://repasscloud.com`
- Work from: `dev`
- Do **not** push directly to `main`.
- The existing repository workflow promotes `dev` to `main` after a successful build.

This is an implementation task, not a planning exercise.

Review the repository, make the changes, test them, update the documentation that governs future work, commit the finished work to `dev`, and push it when it is ready.

Do not stop after producing another review document.

Do not repeatedly ask the user for design or copy decisions that can be reasonably resolved from this brief, the existing site, the repositories, or established good practice. Make sensible decisions and complete as much as possible autonomously.

---

# 1. The strategic change

The current RePass Cloud website feels too much like a consultancy/lead-generation website.

It repeatedly tries to turn visitors into sales enquiries through language such as:

- "Start a conversation"
- "Discuss a project"
- "Talk to us"
- "Book..."
- service engagement language
- repeated contact buttons and CTA banners

That is no longer the desired emphasis.

RePass Cloud should primarily present itself as:

> **An Australian software company that designs, builds, owns, operates, and maintains software products and serious technical systems.**

RePass Cloud can still have engineering capabilities, consultancy work, case studies, cloud automation experience, Microsoft 365 work, PowerShell work, and bespoke enterprise delivery.

However, those things should support the company story.

They should not make the entire site look like an agency funnel.

The site should answer these questions quickly:

1. Who is RePass Cloud?
2. What does RePass Cloud build?
3. What products does RePass Cloud own or operate?
4. What engineering work demonstrates its capability?
5. What is happening at the company/products?
6. Where can I learn more about or obtain a product?
7. How can I contact the company if I genuinely need to?

That is the new hierarchy.

---

# 2. IMPORTANT: supersede the old improvement plan

There is currently a file on `dev`:

`SITE_IMPROVEMENT_PLAN.md`

It recommends, among other things:

- a services-first homepage
- engagement packages
- consulting durations
- more conversion CTAs
- "Book a 30-minute operational review"
- more persistent contact prompts
- turning the site into a client-acquisition funnel

That direction is now explicitly rejected.

This prompt supersedes that document.

Either:

1. replace `SITE_IMPROVEMENT_PLAN.md` with the new product/company-first direction implemented by this task, or
2. remove it if it would otherwise mislead future agents.

Also update `CLAUDE.md` so future Claude sessions understand the new direction.

Do not leave contradictory repository instructions behind.

---

# 3. Preserve the current RePass Cloud visual identity

The current design language is liked and must remain recognisably RePass Cloud.

Do **not** redesign the site into generic corporate blue SaaS styling.

Preserve the spirit of the current palette and design system, including the established colours such as:

- black: `#000000`
- pink: `#e35f9a`
- purple: `#ab2df3`
- gold: `#ffbe16`
- magenta: `#e92bcf`

The current light surfaces, gradients, rounded cards, typography hierarchy, spacing, and generally modern feel are good starting points.

You may refine:

- spacing
- card composition
- typography scale
- section density
- responsive behaviour
- navigation
- product presentation
- accessibility
- component reuse
- performance

But the result must still clearly feel like the existing RePass Cloud brand.

Avoid:

- generic template appearance
- huge stock-photo heroes
- excessive animation
- gradients everywhere
- overuse of glassmorphism
- fake customer-logo strips
- fake testimonials
- marketing clutter
- a redesign that destroys the recognisable pink/purple/gold identity

Use existing CSS patterns where they are good. Refactor repeated styles into reusable classes/components where useful.

---

# 4. Current structural problems to correct

The current source has these top-level concepts competing for attention:

- Services
- Case Studies
- Work
- Posts
- Careers
- About
- Contact
- products partially embedded into homepage/project content

The header currently gives primary navigation prominence to:

- Services
- Case Studies
- Work
- Posts
- Careers

and then adds:

- Why RePass Cloud
- Start a conversation

This is backwards for the desired company/product identity.

The current homepage is also heavily organised around four service lines and repeated sales CTAs.

The current `projects.astro` mixes:

- active products
- custom/bespoke work
- archived products/projects

This is not a useful product architecture.

Most importantly, the current project data describes **CurseDelete as an archived/retired product**.

That is now wrong.

**CurseDelete 2 is an active RePass Cloud product and must be treated as such.**

---

# 5. New primary information architecture

Restructure the public-facing information architecture around this hierarchy.

## Primary navigation

Use a clean primary nav along these lines:

- **Products**
- **Company**
- **Case Studies**
- **News**
- **Careers**
- **Contact**

`Contact` should be a normal text navigation item, not a visually dominant sales button.

If six primary items become visually cramped, Careers may be moved to the footer, but Products, Company, News and Contact should remain easy to discover.

Do not put a persistent "Start a conversation" / "Book a review" CTA in the header.

## Secondary/capability content

Existing enterprise engineering/service material should remain available where useful for SEO and company credibility, but it should become secondary.

Prefer wording such as:

- Capabilities
- Engineering capabilities
- What we build
- Selected engineering work

rather than making "Services" the defining top-level identity of the company.

Do not casually destroy established URLs with search value.

Existing `/services/...` pages may remain live, but:

- remove aggressive sales CTA banners
- use more neutral engineering/capability language
- link to them from an appropriate "Capabilities" area or footer
- do not make them dominate the homepage or primary navigation

---

# 6. Homepage redesign

Rework `src/pages/index.astro`.

The homepage should feel like the home of a software company, not a landing page for a consultancy.

## Hero

The hero should establish RePass Cloud itself.

The exact wording is yours to refine, but the concept should be closer to:

> RePass Cloud builds software products and operational technology for businesses, technical teams, and modern infrastructure.

or:

> Software products and engineering systems built by RePass Cloud.

It should be clear that RePass Cloud **builds and owns software**, while also having serious enterprise engineering depth.

Avoid a hero built around selling consulting.

### Hero CTAs

Use contextual navigation, for example:

- Primary: **Explore our products**
- Secondary: **About RePass Cloud**

Do not put "Contact us", "Start a conversation", "Book a call", or equivalent in the homepage hero.

## Homepage section order

A good target structure is:

1. Company-led hero
2. Short "About RePass Cloud" / company positioning section
3. Product portfolio / featured products
4. What we build / engineering capabilities
5. Selected proof / case studies
6. Latest News
7. restrained company footer

You may adjust this slightly if the final visual hierarchy is better.

## Product portfolio on homepage

Products need substantial homepage presence.

Show the active/current portfolio with distinct product cards.

At minimum:

### CurseDelete 2

- current RePass Cloud product
- links internally to its dedicated RePass Cloud product page
- should be visually prominent
- should not be described as retired

### Cinturon360

- RePass Cloud product/platform
- its primary product website remains external:
  `https://cinturon360.com`
- link out clearly

### Aethon Jobs

- RePass Cloud product/platform
- its primary website remains external:
  `https://aethon.jobs`
- use the full product name **Aethon Jobs** where appropriate rather than just "Aethon"
- link out clearly

Do not pretend Cinturon360 and Aethon Jobs need full duplicate product websites inside repasscloud.com.

RePass Cloud's Products page should catalogue them and explain their relationship to RePass Cloud, then link to the dedicated product sites.

## Capabilities section

Keep this concise.

It can demonstrate that RePass Cloud has depth in areas such as:

- .NET / enterprise software
- cloud platforms
- automation
- identity
- Microsoft 365 / Entra ID
- PowerShell
- platform engineering
- integrations

But it should not turn into four sales funnels.

The purpose of this section is:

> "This is what the company is capable of building."

not:

> "Choose a consulting package and contact sales."

## Case studies

Keep the useful case studies and measurable outcomes.

They are good engineering proof.

However:

- remove forced contact CTAs from the section/page
- do not invent client names
- do not invent buyer quotes
- do not invent testimonials
- do not invent project durations or metrics
- preserve only facts that can be supported by existing content or source material

## Homepage News section

Rename visible "Posts" language.

Use:

- **News**
- perhaps a section heading like **Latest from RePass Cloud**

The content can include:

- company news
- product announcements
- release news
- engineering articles
- technical guides
- company updates

Do not call the navigation destination "Posts". Users already know the underlying entries are posts.

---

# 7. Create a real Products section

Create a first-class Products route.

Preferred canonical URL:

`/products/`

This page should be an important destination, not a renamed version of the current mixed `Projects` page.

## Products page goals

The page should:

- explain that these products are built/owned/operated by RePass Cloud
- distinguish products hosted on RePass Cloud from products with their own dedicated websites
- make current products clear
- make product status clear where verified
- link cleanly to dedicated product pages/sites
- make it easy to add future products without duplicating arrays in multiple page files

## Product data architecture

Avoid separately hardcoding product definitions in:

- homepage
- footer
- products page
- about page

Create an appropriate reusable source of truth such as:

`src/data/products.ts`

or another clean Astro/TypeScript structure.

The product model should be able to represent things such as:

- name
- slug
- short description
- long description if needed
- logo/icon/image
- product status
- internal vs external destination
- external product website
- optional purchase URL
- optional GitHub/repository link
- platform information
- feature summary
- whether the product should appear on homepage
- SEO fields where useful

Do not over-engineer this into a CMS.

Keep it simple, typed and maintainable.

---

# 8. CurseDelete 2 — dedicated product page

Create a dedicated CurseDelete 2 product page on RePass Cloud.

Preferred route:

`/products/cursedelete/`

Use **CurseDelete 2** as the product branding in visible content.

The URL can remain clean without the version number so future versions do not require a URL migration.

## Source of product truth

Do not invent features.

Inspect the current CurseDelete 2 source/documentation where accessible.

Relevant product repository from the wider project context:

`https://github.com/danijeljw-RPC/cursedelete-2`

Use verified product details from that repository and its documentation if access is available.

If the product repo is unavailable, use only facts already known/verified in the RePass Cloud site and keep unsupported details out.

Do not copy old CurseDelete 1 "retired" wording onto CurseDelete 2.

## CurseDelete page content

Create a proper product page capable of showcasing a commercial software utility.

It should include, where verified:

- what CurseDelete 2 is
- what problem it solves
- primary use cases
- supported platforms
- key capabilities
- why it exists / why it is useful
- installation/download information if applicable
- license model or editions if documented
- technical credibility
- relevant screenshots / terminal examples / product imagery if source material exists
- link to product documentation or repository where appropriate
- purchase section

Keep the copy factual and technical.

Avoid generic phrases such as:

- "revolutionary"
- "world-class"
- "game-changing"
- "next-generation"
- "unleash the power"
- "transform your workflow"

## Stripe purchase flow

The RePass Cloud website does **not** need:

- a shopping cart
- Stripe Elements
- an embedded checkout
- local payment processing
- checkout state
- license issuance code
- customer-account logic

The desired flow is:

`CurseDelete product page -> Purchase licence -> Stripe-hosted payment page`

Stripe handles payment.

The licensing API/server handles license creation/management separately.

The public marketing website should only provide the outbound purchase link.

Create a central constant/config value, e.g.:

`CURSEDELETE_PURCHASE_URL`

Do not scatter a Stripe URL through templates.

### Critical rule

If the actual Stripe hosted purchase URL can be discovered from:

- this repository
- the CurseDelete 2 repository
- existing documentation
- existing configuration/history available to you

then use it.

If it cannot be discovered, **do not fabricate a Stripe URL**.

Still complete the entire product page and wiring.

In that case:

- define the central constant cleanly
- make the unresolved purchase URL obvious in code/documentation
- do not break the site
- do not allow the missing payment URL to block the rest of the redesign

If a verified price or edition structure is available, present it accurately.

If pricing is not verified, do not invent prices.

---

# 9. Cinturon360 and Aethon Jobs

Keep these as products in the RePass Cloud portfolio, but their detailed product experiences remain on their own websites.

## Cinturon360

Canonical external destination:

`https://cinturon360.com`

The RePass Cloud products page should briefly explain what the product is and make it clear that visitors can visit the dedicated Cinturon360 site.

## Aethon Jobs

Canonical external destination:

`https://aethon.jobs`

Use **Aethon Jobs** as the user-facing product name unless the product's own current branding establishes otherwise.

Again, RePass Cloud should catalogue it and link out.

Do not create unnecessary duplicate sales pages for these products on repasscloud.com.

---

# 10. Retired projects / open-source archive

The current `/projects` page mixes active products and old projects.

Separate these concepts.

Legacy work such as:

- LunaVPN
- OptechX
- WanderConnect
- TigerGrab
- CveInfo
- old CurseDelete material

should not compete visually with current products.

Create a lower-priority archive destination if useful, such as:

- `/archive/`
- `/open-source/`
- `/labs/`

Choose the term that best matches the actual material.

"Archive" is probably the clearest if these are retired.

The archive can remain accessible from:

- Products page secondary link
- footer
- relevant historical content

Do not feature retired work next to active products as if all have equal status.

## Old CurseDelete route

Search engines currently associate RePass Cloud with an old CurseDelete page/status that describes it as retired.

Correct this carefully.

Any legacy CurseDelete page should:

- distinguish old CurseDelete from CurseDelete 2
- point visitors to `/products/cursedelete/`
- avoid causing search engines to believe the current CurseDelete product is retired

Preserve old URLs through redirects/canonical handling rather than simply deleting them.

---

# 11. Rename "Posts" to "News"

The visible website should not use "Posts" as a major information architecture label.

Use:

**News**

A useful page title/H1 may be:

**News & Insights**

but the primary nav label should be **News**.

## Preferred canonical routes

- `/news/`
- `/news/<slug>/`

The underlying Astro content collection may remain named `posts` internally if renaming it would create pointless churn.

Implementation names are not the user-facing information architecture.

## Existing content

Existing content contains a mix of:

- technical tutorials
- engineering articles
- company updates
- old product announcements
- old website announcements

Support this mix without pretending every item is breaking company news.

Consider adding a simple optional content classification such as:

- Company
- Product
- Engineering
- Guide
- Archive

Only add taxonomy that materially improves the site.

## Old `/posts` routes

Do not break existing indexed URLs.

Migrate carefully:

- `/posts/` -> `/news/`
- `/posts/<slug>/` -> `/news/<slug>/`

Determine the actual production hosting/redirect capability.

Do not assume a Netlify `_redirects` file produces server-side redirects if the actual host does not support it.

If proper HTTP redirects are supported, use them.

For a static-hosting fallback:

- keep thin old-route redirect pages
- set canonical to the new `/news/...` URL
- set old redirect pages appropriately to avoid duplicate indexing
- use immediate redirect markup/script if needed
- keep old URLs out of the canonical sitemap

## Known typo URL

There is an indexed URL containing:

`mialboxes`

for the Microsoft 365 mailbox article.

Do not silently destroy that URL.

If the content slug is corrected to `mailboxes`, preserve the old misspelled route as a redirect/alias and make the corrected News URL canonical.

---

# 12. Company / About page

Rework the About page so it is genuinely about the company.

The current page still has consultancy-style CTA behaviour and "what we are not" positioning.

The new page should answer:

- What is RePass Cloud?
- What kind of company is it?
- What does it build?
- What products does it own?
- What technical areas does it work in?
- What principles guide product engineering?
- Where does the company operate?
- Where can visitors find its products, code, and news?

Use verified facts only.

Good topics include:

- software product engineering
- operational tooling
- cloud/identity experience
- .NET
- PowerShell
- automation
- product ownership
- pragmatic engineering
- security/auditability where true
- Australian company context

Avoid making the About page a long "hire us" page.

Remove sales-heavy hero CTAs.

A restrained contact link near the end is enough.

Do not fabricate:

- employee counts
- customer counts
- years of experience
- certifications
- revenue
- awards
- office addresses
- client names
- team biographies
- ABN/ACN
- testimonials

unless they can be verified from authoritative project/company sources.

---

# 13. Contact strategy — reduce it substantially

The user explicitly dislikes the amount of Contact messaging on the current site.

Fix this across the whole site.

## Current problem

The homepage currently exposes contact-related actions through several layers, including:

- header CTA
- hero CTA
- bottom CTA
- homepage footer callout
- footer link

Other pages repeat more contact banners.

That makes the site feel desperate to sell something.

## New rule

Contact should be available, not omnipresent.

Use approximately:

- one normal `Contact` item in primary navigation
- one Contact link in the footer

Contextual contact links on a page are allowed only where they are genuinely useful.

Remove generic full-width CTA banners from pages where they add no information.

Do not add:

- floating contact buttons
- sticky "Book a call"
- modal lead forms
- repeated sales banners
- "Start a conversation" after every section

Product pages should use product-specific actions instead:

- Purchase
- Download
- Documentation
- Visit product website
- GitHub
- Learn more

## Contact page itself

The contact page can remain.

However, make it feel like a company contact page rather than a consulting qualification funnel.

A more useful enquiry classification would be something like:

- Product / licensing
- Product support
- Partnerships
- Business / engineering enquiry
- Careers
- Privacy / legal
- Other

Use judgment based on the actual support model.

Do not promise support channels or response SLAs that are not verified.

---

# 14. Footer redesign

Keep the footer useful but quieter.

Suggested groups:

### Company

- About / Company
- Case Studies
- Careers
- News

### Products

- CurseDelete 2
- Cinturon360 ↗
- Aethon Jobs ↗
- Archive / Open Source

### Engineering / Capabilities

- Enterprise platforms
- Cloud tooling
- M365 / identity automation
- PowerShell

### Connect

- Contact
- GitHub
- LinkedIn
- X / Twitter if still current

### Legal

- Privacy
- Terms
- Refunds
- cookie/privacy controls

Do not put another large contact callout above the footer on the homepage.

Preserve required privacy/cookie controls.

Simplify the company copyright line if appropriate.

---

# 15. SEO overhaul

The current SEO code has a reasonable foundation, but the site structure and product discoverability need significant improvement.

Do a proper technical and content SEO pass.

## 15.1 Titles and descriptions

Every important page needs:

- unique title
- useful search description
- clear H1
- content aligned to user intent

Examples of intent:

### Homepage

RePass Cloud as an Australian software/product engineering company.

### Products

RePass Cloud software products.

### CurseDelete

CurseDelete 2 product/software utility page.

### Company

About RePass Cloud.

### News

RePass Cloud company/product/engineering news and articles.

Avoid keyword stuffing.

Do not add obsolete `<meta name="keywords">`.

## 15.2 Fix the broken default Open Graph image

`src/consts.ts` currently defines:

`DEFAULT_OG_IMAGE = '/img/og-default.png'`

but the current `public/img/` contents do not contain that asset.

Fix this.

Create a proper 1200x630 RePass Cloud Open Graph image consistent with the existing brand identity, or point the constant to an existing correct 1200x630 branded asset.

Prefer creating a proper default social image.

It should render well on:

- LinkedIn
- Facebook/Open Graph
- X/Twitter
- messaging link previews

Also add a CurseDelete-specific social image if suitable assets can be created from existing branding/product assets without inventing visual claims.

## 15.3 Robots

`public/robots.txt` is currently essentially only:

`User-agent: *`

Improve it.

At minimum, if appropriate:

```text
User-agent: *
Allow: /

Sitemap: https://repasscloud.com/sitemap-index.xml
```

Do not accidentally block the production site.

## 15.4 Sitemap

The repository already uses `@astrojs/sitemap`.

Verify:

- new Products routes are included
- News canonical routes are included
- redirect/legacy aliases are not treated as preferred canonical content
- legal/utility pages are handled sensibly
- no dead/legacy generated routes pollute the sitemap

## 15.5 Canonicals

Review canonical URL behaviour carefully.

`BaseHead.astro` currently builds canonicals from the current route.

Add support for an explicit canonical override if needed for:

- old `/posts` aliases
- old `/projects` aliases
- legacy CurseDelete pages
- corrected typo routes

Canonical URLs should represent the preferred public URL.

## 15.6 Structured data

Keep the existing useful structured data and improve it where appropriate.

### Site/company

Use appropriate:

- `Organization`
- `WebSite`

data with verified values.

The current homepage `Organization` schema should not define the entire company primarily as a sales contact point.

Remove or neutralise sales-only structured data if it no longer represents the desired site.

### Products page

Consider:

- `ItemList`

for the current product portfolio.

### CurseDelete 2

Use appropriate schema such as:

- `SoftwareApplication`
- and/or `Product`

Only include fields that are actually known.

Do not invent:

- ratings
- reviews
- prices
- operating systems
- offers
- availability

If verified Stripe pricing exists, `Offer` may be appropriate.

If not, omit it.

### News/articles

The current `BlogPosting` implementation is useful.

Update URLs/naming to work with the News route while preserving article metadata.

### Breadcrumbs

Add `BreadcrumbList` where useful on deeper pages such as:

- Products > CurseDelete 2
- News > Article
- Archive > Project

## 15.7 Internal links

Create useful internal linking between:

- homepage -> products
- homepage -> company
- products -> CurseDelete
- company -> products
- relevant News articles -> relevant products
- legacy CurseDelete -> CurseDelete 2
- case studies -> relevant capabilities where useful

Do not turn every paragraph into a link.

## 15.8 Search-index migration

Search results still surface legacy RePass Cloud pages and old product status.

After the route/content work:

- regenerate sitemap
- ensure canonical URLs are correct
- ensure IndexNow tooling receives the new URLs if that workflow is valid
- ensure Google/Bing submission scripts still point to the correct sitemap
- make sure old routes resolve instead of becoming 404s

Do not make unverified claims about forcing Google to instantly update.

---

# 16. Product and brand showcase

The site needs to visually demonstrate that RePass Cloud actually builds products.

Use the existing visual language to make product cards feel more substantive than service cards.

Where verified assets exist:

- use product logos
- use screenshots
- use terminal/product interface examples
- optimise images
- provide descriptive alt text

Do not hotlink random third-party assets.

For RePass Cloud-owned assets, prefer local optimised copies where appropriate.

For external product sites, use a clear external-link affordance.

Product cards should tell the visitor:

- product name
- what it is
- who/what it is for
- whether more detail is on RePass Cloud or an external product site
- the next product-specific action

---

# 17. Content tone

Use Australian English.

Desired tone:

- technical
- calm
- credible
- factual
- concise
- engineering-led
- confident without sounding like an ad agency

Avoid:

- hype
- exaggerated promises
- sales clichés
- "we're passionate about..."
- "unlock"
- "empower"
- "transform"
- "world-class"
- "cutting-edge" unless technically necessary
- repeated "enterprise" in every sentence
- manufactured scarcity
- fake urgency
- conversion-funnel jargon

A software company does not need to ask the visitor to contact it in every section.

Show the work and products.

---

# 18. Current content that should remain useful

Do not throw away good material just because the hierarchy is changing.

Retain and improve where relevant:

- existing case studies
- technical News/article content
- current capabilities pages
- careers/legal content
- privacy and cookie controls
- RSS
- sitemap
- analytics consent logic
- Cinturon360 links
- Aethon Jobs links
- GitHub/social links

This is a repositioning and information-architecture improvement, not a pointless rewrite of every line.

---

# 19. Technical cleanup while doing the work

Perform reasonable cleanup discovered during implementation.

Examples worth checking:

- duplicated hardcoded product arrays
- hardcoded RePass Cloud URLs that belong in constants
- absolute same-site logo URLs that can be local paths
- unused Astro font configuration vs fonts actually used by CSS
- missing/incorrect Open Graph assets
- inaccessible buttons/links
- heading hierarchy
- missing external-link semantics
- image dimensions / layout shift
- mobile navigation
- focus styles
- keyboard navigation
- contrast
- unnecessary scripts
- broken links
- obsolete route references
- Post/News labels left behind
- Projects/Work labels left behind
- duplicate Contact CTAs

Do not make unrelated architecture changes simply because you can.

---

# 20. Accessibility and responsive requirements

The completed site must work properly on:

- mobile
- tablet
- desktop
- wide desktop

Check at least common viewport widths.

Ensure:

- mobile menu works
- keyboard users can operate navigation
- Escape closes mobile menu if that behaviour remains
- focus states are visible
- headings are semantic
- links and buttons are distinguishable
- decorative icons do not harm screen-reader output
- images have useful alt text
- forms have labels
- no horizontal overflow
- product cards do not collapse awkwardly

Preserve good existing accessibility behaviour.

---

# 21. Performance

Keep the static Astro site lightweight.

Avoid adding a large client-side framework.

Prefer:

- static Astro rendering
- CSS
- small targeted scripts only where necessary
- optimised images
- local/static assets
- minimal third-party JS

Review the externally loaded fonts/icons and existing analytics scripts.

Do not remove required analytics/privacy behaviour without understanding it.

If you can improve font loading without changing the site's appearance, do so.

Run Lighthouse or an equivalent audit if your environment supports it.

The result should not become heavier just because the product pages look better.

---

# 22. URL migration rules

Treat URLs as public API.

Do not casually delete established indexed paths.

At minimum consider migration/compatibility for:

- `/projects`
- `/projects/...`
- `/posts`
- `/posts/...`
- old CurseDelete URL(s)
- typo article URLs
- any renamed route discovered while implementing

Use actual redirect functionality supported by the deployment platform where available.

Where only static fallback is possible:

- generate redirect/alias pages
- set correct canonical URLs
- avoid duplicate indexing
- keep aliases out of the primary sitemap

Document the migration in repository documentation.

---

# 23. Update repository documentation

Update `CLAUDE.md` so it reflects the completed site.

It should describe:

- company/product-first positioning
- Products architecture
- CurseDelete 2 local product page
- Cinturon360 external website
- Aethon Jobs external website
- News user-facing naming
- internal content collection naming if it remains `posts`
- product data source
- SEO/canonical patterns
- route compatibility
- Stripe link configuration
- visual identity rules
- reduced Contact CTA philosophy
- branch/build workflow

Also update `README.md` if the site structure or authoring instructions materially change.

Remove or replace `SITE_IMPROVEMENT_PLAN.md` as described earlier.

---

# 24. Build/test requirements

Before committing:

```bash
npm ci
npm audit
npm run build
```

Also run other relevant validation that is already supported by the repo.

If `astro check` is available without unnecessarily changing dependencies, run it.

Check:

- no build errors
- no obvious broken internal links
- expected new routes are generated
- legacy routes are handled
- product external links are correct
- mobile nav
- News pages
- RSS
- sitemap
- robots
- Open Graph asset references
- contact form still works structurally
- privacy/cookie controls still work
- no old homepage text contradicts the new company/product direction

Do not claim checks passed unless they actually ran successfully.

---

# 25. Acceptance criteria

The task is not complete until the following are true.

## Identity

- [ ] RePass Cloud reads primarily as a software/product company.
- [ ] The site still demonstrates serious engineering capability.
- [ ] It no longer reads primarily as a consultancy conversion funnel.
- [ ] Existing visual identity is preserved.

## Navigation

- [ ] Products is first-class.
- [ ] Company/About is easy to find.
- [ ] Posts is no longer a user-facing primary label.
- [ ] News is used instead.
- [ ] Contact is available but not a dominant button everywhere.
- [ ] Service/capability pages are secondary.

## Products

- [ ] `/products/` exists.
- [ ] CurseDelete 2 is shown as active/current, not retired.
- [ ] `/products/cursedelete/` exists.
- [ ] CurseDelete 2 has a genuine product showcase page.
- [ ] CurseDelete has central Stripe purchase-link configuration.
- [ ] No cart or custom payment flow has been added.
- [ ] Cinturon360 links to `https://cinturon360.com`.
- [ ] Aethon Jobs links to `https://aethon.jobs`.
- [ ] Archived products no longer compete with active products.
- [ ] Product data is maintainable from a central source.

## Homepage

- [ ] Hero is company/product-led.
- [ ] Hero CTA is product/company navigation, not contact sales.
- [ ] Products are prominently showcased.
- [ ] Capabilities are concise and supporting.
- [ ] Case studies remain useful proof.
- [ ] News is present.
- [ ] Repeated contact banners are removed.

## News

- [ ] User-facing News section exists.
- [ ] Canonical `/news` routes exist.
- [ ] Existing `/posts` URLs are preserved through redirects/aliases.
- [ ] Old links are not needlessly broken.
- [ ] RSS remains functional and appropriately named.
- [ ] article structured data remains correct.

## Company

- [ ] About page is genuinely company-focused.
- [ ] It does not read like a sales qualification page.
- [ ] Claims are verified rather than invented.

## Contact

- [ ] Header no longer has a loud "Start a conversation" sales CTA.
- [ ] Generic CTA banners are substantially reduced/removed.
- [ ] Contact remains discoverable.
- [ ] Contact page is more general/company-oriented.

## SEO

- [ ] Broken default Open Graph image reference is fixed.
- [ ] robots.txt references the sitemap.
- [ ] sitemap reflects canonical new routes.
- [ ] canonical handling supports legacy aliases.
- [ ] Product structured data is added where appropriate.
- [ ] Organization/WebSite schema is sensible.
- [ ] News/BlogPosting schema remains correct.
- [ ] legacy CurseDelete search signals no longer describe the current product as retired.
- [ ] misspelled indexed mailbox URL is preserved if corrected.

## Quality

- [ ] Site builds.
- [ ] Mobile layout works.
- [ ] accessibility has not regressed.
- [ ] no unnecessary JS framework was added.
- [ ] no fake marketing claims were added.
- [ ] repo documentation reflects the new architecture.
- [ ] contradictory old improvement instructions are removed/replaced.

---

# 26. Final execution and Git workflow

Work from `dev`.

Inspect the branch state first.

The branch currently contains an improvement-plan change that may not yet be on `main`; do not lose unrelated valid work, but the old services-first plan itself is superseded by this prompt.

Implement the complete change set.

Use coherent commits rather than dozens of tiny noise commits.

Before push:

1. review the diff
2. run the required build/tests
3. check generated routes and SEO assets
4. fix any problems
5. update documentation
6. update changelog/release notes if the repo has an established place for them

Then commit and push to:

`origin/dev`

Do not push directly to `main`.

Allow the existing repository promotion workflow to handle the normal dev-to-main process.

At the end, report:

- what changed
- important URL migrations
- product architecture
- CurseDelete purchase-link status
- SEO fixes
- tests/builds run and their results
- commit SHA(s)
- whether `dev` was pushed successfully
- any genuinely unresolved item that could not be completed without an external secret/value

Do not finish with a list of work you expect the user to implement manually if you can implement it yourself.

---

# 27. Guiding principle

When making a judgment call, use this test:

> Does this make RePass Cloud look more like the company that creates the software, or more like a consultancy trying to capture a lead?

Prefer the first.

The visitor should leave understanding:

> **RePass Cloud builds real software products and serious technical systems.**

The products and engineering work should provide the proof.

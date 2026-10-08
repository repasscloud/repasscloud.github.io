export const SITE_TITLE = 'RePass Cloud';
// Homepage <title>. Kept at 50-60 characters for search results.
export const HOME_TITLE = 'RePass Cloud | Australian Software Products and AI Books';
export const SITE_DESCRIPTION =
  'RePass Cloud is an Australian software company and publisher. We build and run CurseDelete 2, Cinturon360 and Aethon Jobs, and publish How-To-Use-AI.com.';
export const SITE_DOMAIN = 'https://repasscloud.com';
export const DEFAULT_OG_IMAGE = '/img/og-default.png';
export const PUBLISHING_OG_IMAGE = '/img/og-publishing.png';
export const ENGINEERING_OG_IMAGE = '/img/og-engineering.png';
export const BRAND_MARK = '/brand/repasscloud-mark.svg';
export const BRAND_LOGO_PNG = '/brand/png/repasscloud-mark-512.png';
export const GTM_CONTAINER_ID = 'GTM-N5D945ZS';
export const GA_MEASUREMENT_ID = 'G-RLMZK1PDGS';

export const CINTURON_URL = 'https://cinturon360.com';
export const GITHUB_URL = 'https://github.com/repasscloud';
export const AETHON_URL = 'https://aethon.jobs';

export const TWITTER_URL = 'https://twitter.com/repasscloud';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/repass-cloud';

export const CONTACT_EMAIL = 'hello@repasscloud.com';
export const COMPANY_LEGAL_NAME = 'RePass Cloud Pty Ltd';
export const COMPANY_ABN = '74 642 243 801';

export const CURSEDELETE_GITHUB_URL = 'https://github.com/repasscloud/cursedelete-2';
export const CURSEDELETE_OG_IMAGE = '/img/og-cursedelete.png';
export const CURSEDELETE_ICON = '/img/cursedelete-icon.png';
export const CURSEDELETE_CHANGELOG_URL =
  'https://raw.githubusercontent.com/repasscloud/cursedelete-2/refs/heads/main/CHANGELOG.md';

// Update this when a new CurseDelete 2 version is published — it's the
// single place the product page's displayed version comes from.
export const CURSEDELETE_VERSION = 'v2.0.0';

// Stripe-hosted purchase pages, one per edition (Community/Education are
// free but still issue a licence through Stripe Checkout). These are
// currently Stripe *test-mode* links (buy.stripe.com/test_...) — swap for
// live-mode links before this goes to production.
export const CURSEDELETE_STRIPE_LINKS: Record<'community' | 'education' | 'business' | 'enterprise', string> = {
  community: 'https://buy.stripe.com/test_dRm3cogwS8zYd7seNuffy04',
  education: 'https://buy.stripe.com/test_fZu28kfsOdUiebwdJqffy05',
  business: 'https://buy.stripe.com/test_dRm9AM0xU8zYd7s20Iffy07',
  enterprise: 'https://buy.stripe.com/test_cNieV6bcy7vUd7s34Mffy08',
};

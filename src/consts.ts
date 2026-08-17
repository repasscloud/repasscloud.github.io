export const SITE_TITLE = 'RePass Cloud';
export const SITE_DESCRIPTION =
  'RePass Cloud is an Australian software company that designs, builds, owns, and operates software products and enterprise technical systems.';
export const SITE_DOMAIN = 'https://repasscloud.com';
export const DEFAULT_OG_IMAGE = '/img/og-default.png';
export const GTM_CONTAINER_ID = 'GTM-N5D945ZS';
export const GA_MEASUREMENT_ID = 'G-RLMZK1PDGS';

export const CINTURON_URL = 'https://cinturon360.com';
export const GITHUB_URL = 'https://github.com/repasscloud';
export const AETHON_URL = 'https://aethon.jobs';

export const TWITTER_URL = 'https://twitter.com/repasscloud';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/repass-cloud';

export const CONTACT_EMAIL = 'hello@repasscloud.com';

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

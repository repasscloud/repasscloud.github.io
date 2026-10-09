import {
  AETHON_URL,
  CINTURON_URL,
  CURSEDELETE_CHANGELOG_URL,
  CURSEDELETE_GITHUB_URL,
  CURSEDELETE_ICON,
  CURSEDELETE_VERSION,
} from '../consts';

export type ProductStatus = 'active' | 'preview';
export type ProductDestination = 'internal' | 'external';

export interface Product {
  /** URL slug used for internal product routes. */
  slug: string;
  /** User-facing product name. */
  name: string;
  /** Short one-line description used on cards. */
  tagline: string;
  /** Longer description used on the Products page. */
  description: string;
  status: ProductStatus;
  statusLabel: string;
  /** Whether the primary product experience lives on repasscloud.com or an external site. */
  destination: ProductDestination;
  /** Where the "learn more" / primary action for this product should go. */
  href: string;
  /** Set when destination is 'external'. */
  externalUrl?: string;
  githubUrl?: string;
  /** Two-letter monogram shown in a tile when iconImage isn't set. */
  monogram: string;
  /** Tile colour for the monogram. */
  colour: string;
  /** Short product type, e.g. "Command-line tool". */
  kind: string;
  /** Real product artwork (site-relative path); takes priority over `monogram` when set. */
  iconImage?: string;
  /** Current published version, e.g. "v2.0.0". Update when publishing a new release. */
  version?: string;
  /** Raw markdown URL for a Keep a Changelog-style CHANGELOG.md, rendered via <Changelog>. */
  changelogUrl?: string;
  tags: string[];
  showOnHomepage: boolean;
}

export const products: Product[] = [
  {
    slug: 'cursedelete',
    name: 'CurseDelete 2',
    tagline: 'A native, high-performance deletion engine for files and directory trees that refuse to die.',
    description:
      'CurseDelete 2 is a from-scratch Rust rewrite of RePass Cloud’s deletion utility. It streams deletion while it enumerates, tunes its own concurrency to the storage target it is running against, and structurally refuses to ever delete a filesystem or SMB share root.',
    status: 'active',
    statusLabel: 'Active product · pre-release',
    destination: 'internal',
    href: '/products/cursedelete/',
    githubUrl: CURSEDELETE_GITHUB_URL,
    monogram: 'CD',
    colour: '#18141f',
    kind: 'Command-line tool',
    iconImage: CURSEDELETE_ICON,
    version: CURSEDELETE_VERSION,
    changelogUrl: CURSEDELETE_CHANGELOG_URL,
    tags: ['Rust', 'CLI', 'macOS', 'Windows', 'Linux'],
    showOnHomepage: true,
  },
  {
    slug: 'cinturon360',
    name: 'Cinturon360',
    tagline: 'Multi-tenant operational control software for identity-sensitive, partner-heavy enterprise workflows.',
    description:
      'Cinturon360 is RePass Cloud’s flagship platform: multi-tenant architecture, delegated administration, identity-aware controls, and full auditability for organisations that need evidence, not just automation.',
    status: 'active',
    statusLabel: 'Active product',
    destination: 'external',
    href: CINTURON_URL,
    externalUrl: CINTURON_URL,
    monogram: 'C3',
    colour: '#6a1fc4',
    kind: 'Enterprise platform',
    tags: ['.NET', 'Azure', 'Entra ID', 'Multi-tenant'],
    showOnHomepage: true,
  },
  {
    slug: 'aethon-jobs',
    name: 'Aethon Jobs',
    tagline: 'Hiring intelligence and verification platform focused on trust and marketplace integrity.',
    description:
      'Aethon Jobs is RePass Cloud’s hiring intelligence platform, built around verified actors, workflow integrity, and recruiter-grade operational flow for hiring marketplaces.',
    status: 'active',
    statusLabel: 'Active product',
    destination: 'external',
    href: AETHON_URL,
    externalUrl: AETHON_URL,
    monogram: 'AJ',
    colour: '#c2186f',
    kind: 'Hiring platform',
    tags: ['.NET', 'Blazor', 'PostgreSQL', 'AI'],
    showOnHomepage: true,
  },
];

export interface ArchiveProject {
  name: string;
  description: string;
  githubUrl?: string;
  note?: string;
}

export const archiveProjects: ArchiveProject[] = [
  {
    name: 'CurseDelete (legacy)',
    description:
      'The original CurseDelete implementations (a cross-platform C# CLI, and an early Rust prototype). Superseded by CurseDelete 2, RePass Cloud’s current active product.',
    note: 'Superseded — see the current product at /products/cursedelete/.',
  },
  {
    name: 'LunaVPN',
    description: 'WireGuard privacy service retained as historical open-source work.',
    githubUrl: 'https://github.com/repasscloud/lunavpn',
  },
  {
    name: 'OptechX',
    description: 'Windows SOE tooling concepts from earlier product work.',
    githubUrl: 'https://github.com/repasscloud/optechx',
  },
  {
    name: 'WanderConnect',
    description: 'Experience platform concept retained as archived reference.',
    githubUrl: 'https://github.com/repasscloud/wanderconnect',
  },
  {
    name: 'TigerGrab',
    description: 'Utility tooling retained for portfolio continuity.',
    githubUrl: 'https://github.com/repasscloud/tigergrab',
  },
  {
    name: 'CveInfo',
    description: 'CLI utility for vulnerability workflow support.',
    githubUrl: 'https://github.com/repasscloud/cveinfo',
  },
];

/**
 * Build-time loader for Keep a Changelog-style CHANGELOG.md files.
 *
 * Splits the file into one entry per `## [version] - date` heading and
 * renders each entry's body as real Markdown (GitHub-flavoured: nested
 * lists, bold, inline code, links, tables) through remark/rehype. Raw HTML
 * in the source is dropped, not passed through. Relative links resolve
 * against the product's GitHub repository, and external links open in a
 * new tab with a trailing ↗ (site convention).
 *
 * Returns an empty list if the fetch fails, so a GitHub outage never
 * breaks the build; pages show a fallback link instead.
 */
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export interface ReleaseEntry {
  /** Version label as written, e.g. "1.1.0" or "Unreleased". */
  version: string;
  /** Anchor id, e.g. "v1-1-0" or "unreleased". */
  id: string;
  /** ISO date (YYYY-MM-DD) when the heading carries one. */
  date?: string;
  /** Link from the file's reference definitions (GitHub release or compare view). */
  url?: string;
  /** Rendered HTML for the entry body. */
  html: string;
  /** Inner HTML of the entry's opening paragraph, when it starts with one. */
  summaryHtml?: string;
  unreleased: boolean;
}

export interface ChangelogOptions {
  /**
   * Base for resolving relative links in the changelog, normally
   * `https://github.com/<owner>/<repo>/blob/main/`.
   */
  linkBase?: string;
  /** Include an "Unreleased" section when it has content. Default true. */
  includeUnreleased?: boolean;
}

const textCache = new Map<string, Promise<string | null>>();

function fetchText(url: string): Promise<string | null> {
  let pending = textCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null);
    textCache.set(url, pending);
  }
  return pending;
}

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** Resolve relative hrefs and mark external links. */
function rehypeSiteLinks(linkBase?: string) {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties) {
        const raw = String(node.properties.href ?? '');
        let href = raw;
        if (raw && !raw.startsWith('#') && !/^[a-z][a-z0-9+.-]*:/i.test(raw) && linkBase) {
          href = new URL(raw, linkBase).href;
        }
        node.properties.href = href;
        if (/^https?:\/\//i.test(href) && !href.startsWith('https://repasscloud.com')) {
          node.properties.target = '_blank';
          node.properties.rel = ['noopener'];
          node.children = [...(node.children ?? []), { type: 'text', value: ' ↗' }];
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function slugifyVersion(version: string): string {
  const slug = version
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return /^\d/.test(slug) ? `v${slug}` : slug;
}

export async function getChangelog(url: string, options: ChangelogOptions = {}): Promise<ReleaseEntry[]> {
  const { linkBase, includeUnreleased = true } = options;
  const text = await fetchText(url);
  if (!text) return [];

  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  // Link reference definitions ("[1.1.0]: https://…") apply to the whole
  // file. Keep them so references inside a section still resolve, and use
  // the version ones as each entry's "on GitHub" link.
  const definitions = new Map<string, string>();
  const definitionLines: string[] = [];
  for (const line of lines) {
    const def = line.match(/^\[([^\]]+)\]:\s*(\S+)/);
    if (def) {
      definitions.set(def[1].toLowerCase(), def[2]);
      definitionLines.push(line);
    }
  }

  type Section = { version: string; date?: string; body: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    // "## [1.1.0] - 2026-11-16", "## [Unreleased]" or "## 1.1.0 - 2026-11-16"
    const heading = inFence ? null : line.match(/^##\s+(?:\[([^\]]+)\]|(\S+))(?:\s+[-–—]\s+(.+?))?\s*$/);
    if (heading) {
      current = { version: (heading[1] ?? heading[2]).trim(), date: heading[3]?.trim(), body: [] };
      sections.push(current);
      continue;
    }
    if (!current || /^\[([^\]]+)\]:\s*\S+/.test(line)) continue;
    current.body.push(line);
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSiteLinks, linkBase)
    .use(rehypeStringify);

  const entries: ReleaseEntry[] = [];
  for (const section of sections) {
    const body = section.body.join('\n').trim();
    const unreleased = section.version.toLowerCase() === 'unreleased';
    if (!body || (unreleased && !includeUnreleased)) continue;

    const markdown = `${body}\n\n${definitionLines.join('\n')}\n`;
    const html = String(await processor.process(markdown)).trim();
    if (!html) continue;

    const date = section.date?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    entries.push({
      version: section.version,
      id: slugifyVersion(section.version),
      date,
      url: definitions.get(section.version.toLowerCase()),
      html,
      summaryHtml: html.match(/^<p>([\s\S]*?)<\/p>/)?.[1],
      unreleased,
    });
  }
  return entries;
}

/** "2026-11-16" → "16 November 2026" (Australian order, no timezone drift). */
export function formatReleaseDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

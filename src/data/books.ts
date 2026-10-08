import type { ImageMetadata } from 'astro';
import book01Cover from '../assets/books/book-01-cover.jpg';

/**
 * The How-To-Use-AI.com book series, published by RePass Cloud Pty Ltd.
 *
 * Source of truth for titles, ISBNs, colours and back-cover copy is
 * `publishing/books.json` in the how-to-use-ai.com repository. Copy changes
 * across when a book's details are finalised there. Purchase links come from
 * https://how-to-use-ai.com/purchase/.
 */

export const SERIES = {
  name: 'How-To-Use-AI.com',
  url: 'https://how-to-use-ai.com',
  purchaseUrl: 'https://how-to-use-ai.com/purchase/',
  launchListUrl: 'https://how-to-use-ai.com/',
  author: 'Danijel-James Wynyard-McClay',
  authorShort: 'DJ',
  authorUrl: 'https://how-to-use-ai.com/author/',
  authorSite: 'https://usefulstash.com',
  publisher: 'RePass Cloud Pty Ltd',
  about:
    'The series starts with someone who has never touched AI and finishes with someone who can design AI systems. Each book assumes only what the books before it taught.',
};

export type BookStatus = 'preorder' | 'available' | 'planned';

export interface Edition {
  label: string;
  format: 'EBook' | 'Paperback';
  isbn?: string;
  isbnDisplay?: string;
  /** Short availability note shown beside the edition. */
  availability: string;
}

export interface StoreLink {
  label: string;
  href: string;
}

export interface Book {
  number: number;
  slug: string;
  title: string;
  subtitle?: string;
  /** Series stage, from books.json `theme`. */
  stage: string;
  descriptor: string;
  /** Spine/accent colour from books.json `accentColour`. */
  accent: string;
  /** Text colour that passes contrast on `accent`. */
  onAccent: string;
  status: BookStatus;
  statusLabel: string;
  /** ISO date, set once a release date is confirmed. */
  releaseDate?: string;
  cover?: ImageMetadata;
  coverAlt?: string;
  category?: string;
  summary?: string[];
  highlightsLead?: string;
  highlights?: string[];
  editions?: Edition[];
  kindleAsin?: string;
  kindleStores?: StoreLink[];
  /** True when the book has its own page on repasscloud.com. */
  page: boolean;
}

const asin = 'B0HLYQSMQT';
const kindleRegions: [string, string][] = [
  ['Australia', 'amazon.com.au'],
  ['United States', 'amazon.com'],
  ['United Kingdom', 'amazon.co.uk'],
  ['Canada', 'amazon.ca'],
  ['India', 'amazon.in'],
  ['Germany', 'amazon.de'],
  ['France', 'amazon.fr'],
  ['Spain', 'amazon.es'],
  ['Italy', 'amazon.it'],
  ['Netherlands', 'amazon.nl'],
  ['Japan', 'amazon.co.jp'],
  ['Brazil', 'amazon.com.br'],
  ['Mexico', 'amazon.com.mx'],
];

export const books: Book[] = [
  {
    number: 1,
    slug: 'ai-for-normal-people',
    title: 'AI for Normal People',
    subtitle: 'Understanding Artificial Intelligence Without the Hype',
    stage: 'Understand',
    descriptor: 'No technical skills required',
    accent: '#7C3AED',
    onAccent: '#FFFFFF',
    status: 'preorder',
    statusLabel: 'Out 29 October 2026',
    releaseDate: '2026-10-29',
    cover: book01Cover,
    coverAlt:
      'Cover of AI for Normal People by Danijel-James Wynyard-McClay: white title on navy above an engraved octopus illustration, with a gold seal reading No technical skills required.',
    category: 'Technology / Artificial intelligence',
    summary: [
      "You've already been using AI in your maps, your inbox, your bank and your streaming queue. This book explains what's actually going on, in plain English, without the hype or the jargon.",
      'AI is software that finds patterns and makes predictions. Once you see it that way, the headlines get less alarming, the tools get more useful, and you can decide for yourself where AI belongs in your life and your work.',
    ],
    highlightsLead: "In this book you'll learn how to:",
    highlights: [
      'Spot the AI you already use every day',
      "Understand what AI can and can't do, and why it sounds so sure of itself",
      'Ask AI tools for what you actually want',
      'Use AI at home and at work without handing over your judgement',
      'Tell real progress from hype',
    ],
    editions: [
      { label: 'Kindle', format: 'EBook', availability: 'Pre-order now' },
      { label: 'EPUB', format: 'EBook', isbn: '9781764994828', isbnDisplay: '978-1-7649948-2-8', availability: 'Direct from how-to-use-ai.com at release' },
      { label: 'PDF', format: 'EBook', isbn: '9781764994811', isbnDisplay: '978-1-7649948-1-1', availability: 'Direct from how-to-use-ai.com at release' },
      { label: 'Paperback', format: 'Paperback', isbn: '9781764994804', isbnDisplay: '978-1-7649948-0-4', availability: 'Coming soon' },
      { label: 'Paperback (colour)', format: 'Paperback', isbn: '9781764994835', isbnDisplay: '978-1-7649948-3-5', availability: 'Coming soon' },
    ],
    kindleAsin: asin,
    kindleStores: kindleRegions.map(([label, host]) => ({ label, href: `https://www.${host}/dp/${asin}` })),
    page: true,
  },
  {
    number: 2,
    slug: 'practical-ai-workflows-and-productivity',
    title: 'Practical AI Workflows & Productivity',
    stage: 'Use',
    descriptor: 'Work smarter with practical AI',
    accent: '#0284C7',
    onAccent: '#FFFFFF',
    status: 'planned',
    statusLabel: 'In development',
    page: false,
  },
  {
    number: 3,
    slug: 'ai-for-business-and-operations',
    title: 'AI for Business & Operations',
    stage: 'Operate',
    descriptor: 'Turn capability into operations',
    accent: '#D97706',
    onAccent: '#18141F',
    status: 'planned',
    statusLabel: 'In development',
    page: false,
  },
  {
    number: 4,
    slug: 'building-ai-systems-and-automation',
    title: 'Building AI Systems & Automation',
    stage: 'Build',
    descriptor: 'Connect tools, systems and workflows',
    accent: '#059669',
    onAccent: '#FFFFFF',
    status: 'planned',
    statusLabel: 'In development',
    page: false,
  },
  {
    number: 5,
    slug: 'ai-engineering-and-architecture',
    title: 'AI Engineering & Architecture',
    stage: 'Engineer',
    descriptor: 'Design reliable AI infrastructure',
    accent: '#BE123C',
    onAccent: '#FFFFFF',
    status: 'planned',
    statusLabel: 'In development',
    page: false,
  },
];

export const bookOne = books[0];

export function formatReleaseDate(iso: string): string {
  return new Date(`${iso}T00:00:00+10:00`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  });
}

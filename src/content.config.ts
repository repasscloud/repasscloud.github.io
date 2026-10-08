import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.optional(image()),
      tags: z.array(z.string()).optional(),
    }),
});

/**
 * Job ads. Drop a markdown file in src/content/jobs/ to publish a role on
 * /careers/ (with schema.org JobPosting data for Google Jobs). With no open
 * roles, /careers/ shows "No jobs currently open". Files starting with "_"
 * are ignored; set `draft: true` to keep a role unpublished. A role also
 * drops off automatically after `closes` when the site is next built.
 * See src/content/jobs/_TEMPLATE.md.
 */
const jobs = defineCollection({
  loader: glob({ base: './src/content/jobs', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences for the listing and meta description (aim for 120-160 characters). */
    summary: z.string(),
    datePosted: z.coerce.date(),
    /** Last day applications are accepted (inclusive). */
    closes: z.coerce.date().optional(),
    employmentType: z
      .enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN'])
      .default('FULL_TIME'),
    remote: z.boolean().default(true),
    /** Where the person must be based, e.g. ["AU"] or ["AU", "NZ"]. ISO country codes. */
    applicantCountries: z.array(z.string()).default(['AU']),
    /** Office location, required when `remote` is false. */
    location: z
      .object({
        locality: z.string(),
        region: z.string().optional(),
        country: z.string().default('AU'),
      })
      .optional(),
    salary: z
      .object({
        min: z.number(),
        max: z.number().optional(),
        currency: z.string().default('AUD'),
        unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']).default('YEAR'),
      })
      .optional(),
    department: z.string().optional(),
    /** Where to apply: a URL or an email address. Defaults to the contact form. */
    apply: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, jobs };

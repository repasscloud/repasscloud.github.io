import { getCollection, type CollectionEntry } from 'astro:content';

export type Job = CollectionEntry<'jobs'>;

const employmentLabels: Record<Job['data']['employmentType'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACTOR: 'Contract',
  TEMPORARY: 'Temporary',
  INTERN: 'Internship',
};

const countryNames: Record<string, string> = {
  AU: 'Australia',
  NZ: 'New Zealand',
  GB: 'United Kingdom',
  US: 'United States',
};

/** Roles that are published and still open at build time, newest first. */
export async function getOpenJobs(): Promise<Job[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jobs = await getCollection('jobs', ({ data }) => {
    if (data.draft) return false;
    if (data.closes && data.closes < today) return false;
    return true;
  });
  return jobs.sort((a, b) => b.data.datePosted.valueOf() - a.data.datePosted.valueOf());
}

export function employmentLabel(job: Job): string {
  return employmentLabels[job.data.employmentType];
}

export function locationLabel(job: Job): string {
  const { remote, applicantCountries, location } = job.data;
  if (remote) {
    const where = applicantCountries.map((c) => countryNames[c] ?? c).join(', ');
    return `Remote (${where})`;
  }
  return location ? [location.locality, location.region].filter(Boolean).join(', ') : 'Australia';
}

export function applyHref(job: Job): string {
  const apply = job.data.apply;
  if (!apply) return `/contact/?topic=careers&role=${encodeURIComponent(job.data.title)}`;
  if (apply.includes('@') && !apply.startsWith('mailto:') && !apply.startsWith('http')) return `mailto:${apply}`;
  return apply;
}

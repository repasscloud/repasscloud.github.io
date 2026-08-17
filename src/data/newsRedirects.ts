/**
 * Maps every previously indexed /posts/<slug>/ URL to its canonical
 * /news/<slug>/ destination. Most entries are 1:1; the mailbox article
 * entry corrects a legacy indexed URL typo ("mialboxes" -> "mailboxes")
 * without breaking the old link.
 */
export const newsSlugRedirects: Record<string, string> = {
  '2023-05-17': '2023-05-17',
  '2023-08-02': '2023-08-02',
  '2023-10-27': '2023-10-27',
  '2023-12-11': '2023-12-11',
  '2023-12-19': '2023-12-19',
  '2024-01-02': '2024-01-02',
  '2024-01-08': '2024-01-08',
  '2026-02-23-find-exclude-directories-prune-guide':
    '2026-02-23-find-exclude-directories-prune-guide',
  '2026-02-28-repasscloud-aot-default': '2026-02-28-repasscloud-aot-default',
  '2026-03-06-export-microsoft-365-mialboxes-powershell':
    '2026-03-06-export-microsoft-365-mailboxes-powershell',
  '2026-03-07-why-most-microsoft-365-identity-automation-fails-in-real-environments':
    '2026-03-07-why-most-microsoft-365-identity-automation-fails-in-real-environments',
  '2026-04-23-ai-governance-data-sovereignty': '2026-04-23-ai-governance-data-sovereignty',
};

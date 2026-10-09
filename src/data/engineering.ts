/**
 * Enterprise engineering capabilities and selected outcomes.
 * Used by the homepage and /engineering/. Each capability has an anchor on
 * /engineering/ that the legacy /services/* URLs redirect to (public/_redirects).
 */

export interface Capability {
  id: string;
  title: string;
  summary: string;
  intro: string;
  scope: string[];
  note?: string;
}

export const capabilities: Capability[] = [
  {
    id: 'enterprise-platforms',
    title: 'Enterprise platforms',
    summary:
      'Multi-tenant software and internal control planes, designed for delegated administration and full auditability.',
    intro:
      'Multi-tenant software and control layers for organisations that need strong governance, identity fidelity and long-term reliability. Permissions, auditability and integration boundaries are architecture decisions from day one, not post-launch fixes.',
    scope: [
      'Multi-tenant architecture with strict tenant isolation',
      'Entra ID integration and delegated administration',
      'Role and permission models for complex organisations',
      'Audit and event evidence for compliance-heavy operations',
      'Subscription and entitlement logic for SaaS products',
      'API boundaries for ERP, HR and ITSM systems',
    ],
    note: 'Cinturon360, our flagship platform, is this model in production.',
  },
  {
    id: 'cloud-tooling',
    title: 'Cloud tooling and governance',
    summary:
      'Automation across Azure and AWS for cost, risk and compliance, with one view of what changed and why.',
    intro:
      'Practical tooling for teams that need operational visibility and control across cloud accounts, teams and providers, connected to the identity, service desk and finance processes they already run.',
    scope: [
      'Cloud cost governance and FinOps visibility',
      'Infrastructure automation that retires manual runbooks',
      'Certificate and expiry-risk tracking',
      'Cross-cloud operational dashboards for Azure and AWS',
      'Remediation workflows with clear ownership',
      'Integration with Microsoft and ITSM platforms',
    ],
  },
  {
    id: 'm365-automation',
    title: 'Microsoft 365 identity',
    summary:
      'Entra ID lifecycle automation for joiners, movers and leavers, with approvals and evidence built in.',
    intro:
      'Manual identity administration turned into governed automation, so access, licensing and lifecycle changes stay accurate at scale and leave a clean audit trail.',
    scope: [
      'Onboarding and offboarding orchestration',
      'Entra ID policy and role governance',
      'Licence assignment and reclamation',
      'Mailbox and group access with approvals',
      'Integration with HR and ITSM data sources',
      'Audit-grade reporting and exception handling',
    ],
  },
  {
    id: 'powershell',
    title: 'PowerShell delivery',
    summary:
      'Supported modules that replace manual runbooks, with logging and rollback you can rely on.',
    intro:
      'Production PowerShell that removes repetitive work without giving up supportability. Modules are idempotent, logged, tested where practical, and documented so they never depend on one person.',
    scope: [
      'Identity and access automation modules',
      'Approval-aware workflow orchestration',
      'Operational reporting and evidence pipelines',
      'Service management and remediation scripts',
      'Glue between legacy and modern systems',
      'Tested, maintainable modules for enterprise teams',
    ],
  },
];

export interface Outcome {
  context: string;
  headline: string;
  detail: string;
  problem: string;
  approach: string;
  tags: string[];
}

export const outcomes: Outcome[] = [
  {
    context: 'Identity automation, retail',
    headline: '2,100 staff on rule-driven Microsoft 365 lifecycle automation',
    detail: 'Account lifecycle, group access and mailbox changes run from HR events, without daily manual IT work.',
    problem:
      'Identity operations across multiple brands took significant manual IT effort for account lifecycle, group access and mailbox governance.',
    approach:
      'Rule-driven automation tied HR events to identity actions, approvals and policy-safe controls across Microsoft 365 and adjacent systems.',
    tags: ['Microsoft 365', 'Entra ID', 'PowerShell'],
  },
  {
    context: 'Finance operations, 200+ brands',
    headline: 'An estimated four full-time roles of manual processing removed',
    detail: 'Petty cash approvals, provisioning and reconciliation now run as one governed workflow.',
    problem:
      'Manual approval and reconciliation workflows created cost, delay and control risk across a large retail footprint.',
    approach:
      'End-to-end workflow orchestration brought identity, approvals and reporting into one governed flow.',
    tags: ['Oracle HCM', 'Workflow automation', 'Identity'],
  },
  {
    context: 'FinOps, multi-cloud',
    headline: 'About US$7M of annual cloud spend in one governed view',
    detail: 'AWS, Azure and GCP spend classified, owned and tracked, with realised savings measured over time.',
    problem:
      'Cloud spend ownership and savings tracking were fragmented across AWS, Azure and GCP, with no single decision view.',
    approach:
      'A governance tool classified spend, tracked remediation actions and connected cost findings to accountable teams.',
    tags: ['AWS', 'Azure', 'GCP', 'FinOps'],
  },
];

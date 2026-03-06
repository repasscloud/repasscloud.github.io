+++
title = "Microsoft 365 Identity & Access Automation"
meta_title = "Microsoft 365 Identity & Access Automation Case Study | RePass Cloud"
description = "How RePass Cloud built a rule-driven Microsoft 365 automation system to manage dynamic distribution list and shared mailbox access for a multi-brand organisation across Australia and New Zealand."
meta_description = "RePass Cloud case study: automated Microsoft 365 distribution list and shared mailbox management for a 2,100-employee multi-brand organisation across AU and NZ. Zero manual IT intervention. Full audit trail."
keywords = ["Microsoft 365 automation case study", "Entra ID automation", "distribution list automation", "shared mailbox automation", "M365 identity automation", "multi-brand Microsoft 365", "scheduled access management", "Microsoft 365 Australia", "identity lifecycle automation", "RePass Cloud"]
date = 2026-03-06
draft = false
type = "page"
showTableOfContents = true
+++

Last updated: 2026-03-06

[← Back to Case Studies](/case-studies/)

## Overview

**Organisation size:** ~2,100 employees
**Regions:** Australia and New Zealand
**Capability:** Microsoft 365 & Identity Automation
**Platform:** Microsoft 365, Entra ID, Exchange Online

## The Problem

A large multi-brand organisation operating across Australia and New Zealand needed to manage how staff accessed communications, shared mailboxes, and distribution lists — dynamically, based on which brand each employee was representing on a given day of the week.

Staff rotated between brand responsibilities throughout the week. On any given day, an employee representing Brand A needed to receive that brand's communications and have access to its shared mailboxes — and not those of the other brands they were not representing that day. The reverse applied when assignments changed.

Managing this manually was not sustainable. The IT team was making distribution list and mailbox access changes by hand each week, resulting in:

- Inevitable errors and access inconsistencies
- Delays when changes were not processed before the business day started
- Staff receiving communications for brands they were not representing
- No reliable audit trail of who had access to what, and when
- IT staff spending significant time on a repetitive, low-value task with zero tolerance for error

There was no native Microsoft 365 capability that could manage this scheduling behaviour out of the box. The organisation needed a custom automation layer built on top of their existing Microsoft 365 environment.

## What We Built

We designed and delivered a scheduled Microsoft 365 automation system that manages distribution list membership and shared mailbox access dynamically, based on each employee's brand assignment schedule.

### Schedule-Driven Access Engine

The core of the system is a rule-driven scheduling engine that:

- Evaluates each affected employee's brand assignment at the start of each business day
- Determines which distribution lists each employee should be a member of for that day
- Determines which shared mailboxes each employee should have access to for that day
- Compares the required state against the current state in Microsoft 365
- Applies only the changes needed — additions and removals — to bring Microsoft 365 into alignment

### Configuration-Managed Rules

Brand roster assignments and scheduling rules are managed through configuration, not hardcoded logic. This means:

- Brand rosters can be updated without touching the automation code
- New brands or schedule patterns can be added through configuration changes
- The IT team retains control of the rules without needing developer involvement for routine changes

### Audit Logging

Every change made by the system is logged with:

- The employee affected
- The distribution list or shared mailbox modified
- The type of change — addition or removal
- The timestamp of the change
- The scheduling rule that triggered it

This provides a complete, queryable audit trail for compliance, troubleshooting, and access review purposes.

### Operational Reliability

The system was built to run unattended on a daily schedule. It includes:

- Error handling and alerting for failed operations
- Retry logic for transient Microsoft 365 API failures
- Summary reporting so the IT team can confirm each daily run completed successfully without needing to review every individual change

## Outcome

- **Zero manual intervention** required for day-to-day distribution list and shared mailbox access changes
- Access is correct at the start of every business day without IT team involvement
- Staff receive communications only for the brands they are representing on that day
- **Full audit history** of every access change is available for compliance and review
- Access errors and delays caused by manual handling were eliminated entirely
- The IT team reclaimed meaningful time previously spent on repetitive weekly access management

## Related Capabilities

This engagement is an example of our [Microsoft 365 & Identity Automation](/about/#microsoft-365--identity-automation) capability. We build similar automation for organisations that need dynamic, rule-driven control over Microsoft 365 identities, access, and communications — without manual IT intervention.

**Email:** [hello@repasscloud.com](mailto:hello@repasscloud.com)

+++
title = "Multi-Cloud FinOps Tooling — Cost Governance Across a $7M USD Annual Cloud Estate"
meta_title = "Multi-Cloud FinOps Tooling Case Study | RePass Cloud"
description = "How RePass Cloud built a multi-cloud cost analysis and governance platform for an organisation spending $7M USD per year across AWS, Azure, and Google Cloud — identifying approximately $2M in annual savings."
meta_description = "RePass Cloud case study: multi-cloud FinOps platform built for a 5,000-employee global organisation spending $7M USD/year across AWS, Azure, and GCP. Unified cost view, findings engine, decision workflow, and $2M savings target identified."
keywords = ["multi-cloud cost optimisation", "FinOps tooling", "AWS Azure GCP cost management", "cloud spend analysis", "cloud cost governance", "cloud waste identification", "FinOps platform Australia", "cloud rightsizing", "reserved instance optimisation", "cloud cost case study", "RePass Cloud FinOps"]
date = 2026-03-06
draft = false
type = "page"
showTableOfContents = true
+++

Last updated: 2026-03-06

[← Back to Case Studies](/case-studies/)

## Overview

**Organisation size:** ~5,000 employees
**Regions:** Global
**Annual cloud spend:** ~$7M USD across AWS, Azure, and Google Cloud
**Capability:** Cloud Infrastructure Tooling, FinOps, Multi-Cloud Governance
**Clouds covered:** Amazon Web Services, Microsoft Azure, Google Cloud Platform

## The Problem

An organisation spending approximately $7 million USD per year across AWS, Azure, and Google Cloud had no unified view of where that money was going or whether it was being spent efficiently.

Cloud spend had grown organically across teams, accounts, and providers over several years. The result was a fragmented estate with no consistent governance:

- No single view of spend across all three clouds
- Resources provisioned without consistent ownership tagging
- Compute sized for historical peak demand that had long since passed
- Backup and storage retention never reviewed at scale
- Commitments and reservations not aligned to actual steady-state usage
- Non-production environments running continuously outside business hours
- Manual backup copies accumulating alongside managed backup policies
- Orphaned resources — disks, snapshots, endpoints, test environments — spread across accounts with no clear owner

The organisation knew there was waste. They could not quantify it, assign it, or systematically remove it. Existing per-cloud billing dashboards showed spend but offered no workflow for acting on findings, tracking decisions, or verifying that savings had actually been realised.

They needed more than a dashboard. They needed a system that could produce findings, manage the decision lifecycle, enforce accountability, and measure outcomes over time.

## What We Built

We designed and delivered a multi-cloud cost analysis and governance platform operating across four layers.

### Layer 1: Ingestion and Normalisation

The platform ingests data daily from all three cloud providers, including:

- Billing exports and cost and usage reports
- Resource inventories across accounts, subscriptions, and projects
- Performance metrics for compute, storage, and network resources
- Backup and snapshot metadata
- Storage access and lifecycle metadata
- Native rightsizing and optimisation recommendations from AWS Cost Optimization Hub, Azure Advisor, and GCP Recommender
- Commitment and reservation coverage data

All data is normalised into a common canonical schema that abstracts provider-specific naming conventions. A virtual machine is a virtual machine regardless of whether it lives in AWS, Azure, or GCP. A backup artifact is a backup artifact. This makes findings consistent and comparable across clouds without needing separate workflows per provider.

### Layer 2: Findings Engine

The platform runs a structured findings engine across the normalised data, producing categorised, evidence-backed findings with estimated savings, confidence scoring, and business risk assessment.

Finding categories include:

**Compute:**

- Idle virtual machines — no meaningful CPU, memory, network, or disk activity over a 30, 60, or 90-day window
- Underutilised virtual machines — low multi-signal utilisation assessed across CPU, memory, disk throughput, and network usage
- Oversized virtual machines — current instance family and size compared against newer-generation equivalents and actual demand profiles
- Non-production compute running continuously — environments without scheduling outside business hours

**Storage:**

- Unattached and orphaned volumes — block disks and file shares no longer connected to active resources
- Object storage tiering candidates — data not accessed in 180 or 365 days identified for lifecycle movement to cheaper storage tiers
- Stale exports, log buckets, and temporary data areas — retained beyond reasonable operational windows
- Underutilised file shares — provisioned capacity significantly exceeding actual usage over extended periods

**Backup and Protection:**

- Manual backup copies — snapshot and backup artifacts created outside managed retention policies
- Snapshots retained beyond policy — chains retained longer than organisational policy requires
- Cross-region duplicate copies — backup copies replicated without a documented policy justification
- Backup sets linked to no active resource — orphaned vaults and containers from decommissioned workloads

**Commitments and Commercial:**

- Reservation and savings plan coverage gaps — predictable steady-state workloads still running on on-demand pricing
- Commitment underutilisation — reserved capacity purchased but not fully consumed
- Instance family mismatch — older generation resources where a newer equivalent offers better price-performance

**Anomalies:**

- Sudden month-on-month cost increases by service, account, or team
- Untagged or unowned spend — resources with no identifiable owner or cost centre attribution

Each finding includes: estimated monthly cost affected, estimated monthly saving, estimated annual saving, confidence score, evidence window, suggested action, business risk assessment, and the data signals that triggered it.

### Layer 3: Review Workflow

The most important design principle of the platform is that identifying waste is not enough. Every finding moves through a structured decision lifecycle:

- Findings are assigned to the resource owner or responsible team
- Teams can accept a finding for action, defer it to a future date, or ignore it
- Ignores require a structured reason selected from a defined list, an approver, a written justification, and an expiry date
- Ignored spend does not disappear — it resurfaces automatically when the ignore expires and re-enters the review queue
- Every decision is logged with a full comment, approval, and timestamp history

Structured ignore reasons include categories such as: business-required standby, licensing constraint, pending migration, seasonal peak preparation, compliance retention requirement, DR design, and recommendation assessed as incorrect.

This prevents the two most common failure modes of cost governance tools: findings that are permanently dismissed with no accountability, and savings that are claimed but never verified.

### Layer 4: Reporting and Governance Views

The platform produces two distinct reporting layers.

**Operational view** — used by engineering and platform teams:

- Current month spend by cloud, service family, team, and environment
- Active findings with aging and priority ranking
- Top resources by avoidable monthly cost
- Resources with no owner
- Production versus non-production spend split
- Newly detected anomalies

**Executive FinOps view** — used by finance and leadership:

- Total spend and month-on-month trend
- Committed versus on-demand spend ratio
- Realised savings year-to-date
- Forecasted savings in pipeline
- Ignored spend total by reason category
- Review compliance rate by team
- Cloud and provider spend breakdown

## Savings Framework

The platform was designed to identify savings systematically across five categories, with realistic target ranges based on the characteristics of the estate:

| Category | Typical Target Range |
| --- | --- |
| Compute rightsizing and non-production scheduling | 10–15% of compute spend |
| Storage lifecycle, orphan cleanup, and tier optimisation | 4–8% of total spend |
| Commitment, reservation, and savings plan alignment | 5–10% of compute and database spend |
| Backup and DR cost optimisation | 2–5% of total spend |
| Network rationalisation and tooling consolidation | 1–3% of total spend |

A key design decision was to track three savings numbers separately throughout the platform:

- **Identified savings** — findings raised with estimated value
- **Approved savings** — findings accepted by owners and committed for action
- **Realised savings** — savings verified as achieved and reflected in actual billing

Conflating these three numbers is how cloud cost programmes overstate their impact. Keeping them separate gives the organisation an honest view of what has actually been achieved versus what is still in progress.

## Outcome

- A single, unified cost view across AWS, Azure, and Google Cloud — replacing fragmented per-cloud billing reviews
- Structured findings engine producing evidence-backed, categorised savings opportunities with ownership and confidence scoring
- Full decision workflow with audit history, structured ignore reasons, expiry-enforced accountability, and no permanent dismissals
- Savings ledger distinguishing identified, approved, and realised savings at all times
- Monthly governance cadence providing engineering teams, FinOps leads, and leadership with the right level of visibility at each layer
- Approximately **$2 million USD in annual savings identified** — representing approximately 28% of the organisation's total annual cloud spend — across compute, storage, backups, commitments, and orphaned resources

## Related Capabilities

This engagement is an example of our [Cloud Infrastructure Tooling](/about/#2-cloud-infrastructure-tooling) capability. We build similar tools for organisations that need structured, multi-cloud cost governance — not just billing dashboards, but decision workflows, accountability frameworks, and verified savings tracking.

**Email:** [hello@repasscloud.com](mailto:hello@repasscloud.com)

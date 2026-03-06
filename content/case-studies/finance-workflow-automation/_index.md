+++
title = "Finance Workflow Automation — Petty Cash Processing at Scale"
meta_title = "Finance Workflow Automation Case Study | RePass Cloud"
description = "How RePass Cloud replaced a 4-person manual accounts payable process with an end-to-end automation system handling petty cash submissions across 200+ brands and 2,000+ locations in Australia, New Zealand, and Singapore."
meta_description = "RePass Cloud case study: automated petty cash processing for a 2,300-employee organisation across 200+ brands and 2,000+ locations in AU, NZ and SG. 4 FTE roles freed. Oracle HCM integration. GST-aware calculations."
keywords = ["finance workflow automation", "accounts payable automation", "Oracle HCM integration", "petty cash automation", "GST calculation automation", "Active Directory budget codes", "Entra ID finance integration", "multi-location finance automation", "business process automation Australia", "RePass Cloud case study"]
date = 2026-03-06
draft = false
type = "page"
showTableOfContents = true
+++

Last updated: 2026-03-06

[← Back to Case Studies](/case-studies/)

## Overview

**Organisation size:** ~2,300 employees
**Regions:** Australia, New Zealand, and Singapore
**Brands:** 200+
**Locations:** 2,000+
**Capability:** Business Process Automation, Identity Integration, Finance Systems
**Integrations:** Active Directory, Entra ID, Oracle HCM

## The Problem

A large multi-brand organisation operating more than 2,000 locations across Australia, New Zealand, and Singapore had a significant and growing manual burden in its accounts payable operations.

Every business day, petty cash transactions submitted from locations across all brands needed to be collected, validated, categorised, and entered into the organisation's Oracle HCM finance system. The process required accounts payable staff to:

- Manually collect transaction records and receipts from locations across three countries
- Identify and separately calculate GST and non-GST amounts for each transaction
- Look up the correct organisational budget codes for each submitting employee
- Reconcile and consolidate everything into a daily report
- Manually enter the finalised data into Oracle HCM

This consumed the **full working capacity of four accounts payable team members every day**. The process was:

- Entirely manual with no automation at any stage
- Prone to calculation errors, miscoded budget entries, and missing receipts
- Unscalable — adding brands or locations directly increased the manual workload
- Dependent on individual staff knowledge to look up budget codes correctly
- Producing no structured audit trail of submissions or decisions

As the organisation continued to grow, the problem was only going to get worse.

## What We Built

We designed and delivered an end-to-end petty cash processing automation system, covering submission capture, validation, identity-driven data enrichment, GST calculation, daily consolidation, and Oracle HCM-ready output.

### Structured Web Submission Form

We replaced the manual collection process with a purpose-built web form used by staff at the point of expense submission. The form captures:

- Transaction details and amounts
- Receipt images or payment confirmation screenshots, uploaded directly at submission time
- All data required for downstream processing, validated at the point of entry

This eliminated the manual collection step and ensured submissions arrived in a consistent, structured format regardless of which brand or location they came from.

### GST-Aware Calculation Engine

The system automatically identifies and separates GST and non-GST amounts for each submitted transaction. Calculations are applied consistently across every submission, removing the manual calculation step and the errors that came with it.

### Identity-Driven Budget Code Lookup

Rather than relying on accounts payable staff to manually look up budget codes, the system queries each submitting employee's record in Active Directory and Entra ID at the time of submission to retrieve the correct organisational budget codes automatically.

This means:

- Budget codes are always sourced from the authoritative identity system
- Miscoding caused by manual lookup or staff knowledge gaps is eliminated
- Budget code changes made in Active Directory or Entra ID are reflected automatically, with no process updates required

### Automated Daily Consolidation

Throughout each business day, the system collects and processes submissions as they arrive. At **6:00 PM each day**, it automatically:

- Consolidates all submissions received that day across all brands and locations
- Validates completeness and flags any submissions requiring review
- Produces a structured daily finance report categorised by brand, location, budget code, and GST status
- Generates an Oracle HCM-ready output file formatted for direct upload into the finance system

### Finance Team Review and Upload

The finance team receives the consolidated daily report at 6:00 PM, reviews it, and uploads the Oracle HCM output file directly. No manual data entry into Oracle HCM is required.

## Outcome

- **4 full-time accounts payable roles** freed from their primary daily processing duty, enabling redeployment to higher-value finance work
- Daily petty cash consolidation across **200+ brands** and **2,000+ locations** in three countries now runs automatically
- GST calculations are consistent and accurate across every submission
- Budget code assignment is identity-driven and reliable — sourced directly from Active Directory and Entra ID
- The finance team receives a clean, structured daily report at 6:00 PM ready for review and Oracle HCM upload
- Manual data entry into Oracle HCM eliminated entirely
- The organisation gained full scalability — adding new locations or brands does not increase the manual processing burden
- A complete submission and processing audit trail is retained for every transaction

## Related Capabilities

This engagement draws on our [Business Operations & IT Tooling](/about/#3-business-operations--it-tooling) and [Microsoft 365 & Identity Automation](/about/#microsoft-365--identity-automation) capabilities. We build similar automation for organisations that need to connect identity systems, operational data, and finance platforms to remove manual processing work at scale.

**Email:** [hello@repasscloud.com](mailto:hello@repasscloud.com)

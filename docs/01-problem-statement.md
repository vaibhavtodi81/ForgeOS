# 01. Problem Statement

## 1. Background

Mid-sized and large builders and developers in India rarely run a single site. A typical builder owns several land parcels, each at a different stage (acquisition, approvals, excavation, structure, finishing, handover), often in different cities or states. Each project has its own site engineers, supervisors, contractors, and vendors handling materials, labour, machinery, and payments.

## 2. The core problem

> **Builders have no single, reliable view of what is happening across all their projects, what resources each one is consuming, how much is being wasted, and what is owed or paid.**

Information lives in WhatsApp groups, paper registers, Excel sheets, accounting software, and the heads of individual site people. By the time it reaches the owner it is late, incomplete, or inconsistent.

## 3. Problems in detail

### A. Project visibility
- Owners cannot see real progress without visiting or calling.
- Progress is reported verbally or by photo, with no structured comparison against plan.
- Delays are discovered late, after they have already cost money.

### B. Resource tracking
- Materials (cement, steel, sand, aggregate, bricks, etc.) are received, issued, and consumed without a consistent record.
- Stock at each site is unclear, leading to emergency purchases at higher prices or idle labour waiting for material.
- Machinery usage (hours, fuel) and labour attendance are recorded on paper and are easy to inflate.

### C. Wastage and leakage
- There is no baseline for what a project *should* have consumed at a given stage.
- Over-ordering, theft, rework, spoilage, and breakage go unnoticed.
- Wastage is estimated only after the fact, which is too late to correct.

### D. Billing and payments
- Vendor and contractor bills are scattered across sites and people.
- Status is unclear: what is approved, pending, partially paid, or disputed.
- Bills are not tied to the project or delivery they relate to, so verification is slow.
- Delayed payments strain vendor relationships and raise future costs.
- Consolidating cost per project or across projects takes days of manual effort.

### E. Team and accountability
- Different people follow different formats, so data is inconsistent.
- No trail shows who entered, approved, or changed what.

### F. Land and project portfolio
- Land details (location, area, ownership, purchase) are not linked to the projects running on them.
- No portfolio-level view of budget versus actual across all projects.

## 4. Gaps in the current market

| Existing approach | Where it falls short |
|---|---|
| Excel, paper registers, WhatsApp | Not real-time, error-prone, no audit trail, no consolidation |
| General accounting software | Records money well but not site operations, consumption, or progress |
| Global construction platforms | Often expensive, complex, built for foreign workflows, and light on Indian needs (GST fields, local units such as bags and cft, contractor-based labour) |
| Generic project/task tools | Task-oriented, with no concept of materials, stock, wastage, or billing tied to site activity |
| Custom ERP | Costly and slow to implement, which puts it out of reach for many mid-sized builders |

**The gap:** no affordable, simple, India-focused tool connects project progress, resource usage, wastage, and billing in one place across multiple sites.

> **Team action:** before the final report, review 3-4 real products (pricing, features, limits) and add a short comparison table here. This strengthens the case.

## 5. Proposed solution

A web platform with two roles:

- **Admin (Builder):** portfolio-level control and oversight.
- **Project Manager:** the single data-entry person per project, who enters everything about the site.

Core capabilities: multi-land/multi-project management, daily site logs, per-project stock ledger, **progress-adjusted wastage detection**, centralised billing with an approval workflow and payment tracking, dashboards, and an audit trail.

## 6. Success criteria

- An Admin sees status, spend, wastage, and pending payments of every project from one dashboard.
- A PM logs a day's activity (progress, labour, machinery, material movement) in a few minutes.
- Every bill is traceable to a project, a vendor, a submitter, and an approver.
- Wastage is flagged **while the project is running**, not after.
- Reports that took days to compile are produced in seconds.

## 7. Scope boundaries

**In scope (Version 1):** see `02-requirements.md`.

**Out of scope:** full accounting or tax filing; drawings/BIM; customer-facing sales or flat booking; payment gateway integration (payments are *recorded*, not processed); AI/ML prediction; vendor, contractor, or site-operator logins; multi-company tenancy.

## 8. Assumptions and constraints

- Web application: frontend, backend, relational database.
- Users have limited technical skill, so the interface must be simple and mobile-friendly.
- Data quality depends on PM entry, so forms must be fast and hard to skip.
- Indian context: INR, GST-aware billing, local units.
- Built by four students in about one month, so scope is deliberately constrained.

---
name: rakurs-router
description: "Choose the smallest appropriate RAKURS workflow for a non-trivial task without expanding its scope."
---

# Rakurs Router

Use at the start of a non-trivial RAKURS task when the workflow is unclear. For
a simple edit, answer, or inspection, work directly.

Route by intent:

- undecided direction → `dale-brainstorm`;
- coupled work needing a dependency map → `dale-graph`;
- bounded implementation that must reach an observable outcome → `dale-loop`;
- formal claim verification → `dale-proof`;
- explicitly requested independent assurance → `dale-max`;
- visual explanation → `dale-visualize`;
- proposed production dependency → `dependency-safety` before approval.

Apply repository rules from `AGENTS.md`. Read additional project material only
when the task needs it: domain and pricing rules for product, price or lead-time
changes; the prototype for visual parity; localized messages for user-facing
copy. Preserve these non-negotiable boundaries:

- `_source/**` is read-only;
- prices are recomputed and validated server-side before persistence or payment;
- customer-facing text belongs in translation files;
- styling follows the established Tailwind and Karkas design system;
- new production dependencies and work outside the agreed sprint require owner
  approval.

Use tools that actually exist in the active environment. Do not route to
Claude-specific commands or unavailable skills. After a non-trivial change,
run the cheapest sufficient validation, ending with the relevant user-visible or
contract-level signal.

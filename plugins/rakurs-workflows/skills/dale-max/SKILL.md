---
name: dale-max
description: "Run an explicitly requested independent-review gate for high-risk implementation, migration, or delivery work."
---

# Dale Max

Use only when the user explicitly requests maximum assurance, adversarial review,
or an independent quality gate. Do not activate for routine implementation.

Define the observable outcomes, forbidden outcomes, and evidence needed before
work begins. The implementer produces the change; an independent reviewer then
assesses the actual artifact and evidence against the stated criteria. Use
delegation only when it is available and authorized. If an independent reviewer
cannot be provided, say so rather than presenting a same-context review as
independent.

The gate returns one verdict:

- `PASS` — all material criteria have direct evidence;
- `REVISE` — a bounded correction can resolve the findings;
- `REJECT` — the approach is structurally wrong and must be replanned;
- `BLOCKED` — authority, dependency, or evidence is unavailable.

Preserve approval boundaries, redact credentials from reviewer inputs, and do
not trade away a material review lens to save time.

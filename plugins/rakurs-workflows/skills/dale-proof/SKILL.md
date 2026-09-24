---
name: dale-proof
description: "Produce a scoped evidence verdict for a technical claim when formal verification is requested."
---

# Dale Proof

Use when the user asks whether a technical claim is actually true and expects a
formal evidence-backed verdict. Verify; do not repair unless the user separately
asks for a fix.

1. Preserve the claim's material scope and split it into atomic claims where
   necessary.
2. Seek the shortest fresh, reproducible primary signal for each claim. Match
   the evidence to the claim: source inspection proves intent, while runtime or
   integration evidence proves behavior.
3. Distinguish declared, implemented, tested and observed facts. Do not promote
   green secondary checks or an inventory of tests into a runtime guarantee.
4. Resolve conflicting evidence by directness, freshness and scope, not by a
   vote.

Return `PROVEN`, `PARTIAL`, `UNPROVEN`, or `CONTRADICTED`, along with the
verified scope, strongest signal, exact safe checks, coverage boundary, and one
next decisive check only if it could change the verdict. Preserve dirty trees,
production systems and secrets.

---
name: dale-proof
description: Verify a technical claim (an implementation, fix, migration, deployment, runtime behavior, or compatibility boundary) by mapping atomic claims to direct, fresh, reproducible primary signals and returning scoped PROVEN / PARTIAL / UNPROVEN / CONTRADICTED verdicts with a compact proof capsule. Use when the user invokes /dale-proof or asks to prove, verify, confirm, or validate whether a result is actually true. Do NOT use as general code-review, implementation, or remediation.
---

# Dale Proof (Claude-native)

Establish what the available evidence *actually* proves. Work backward from a
claim to the shortest decisive observation. Never promote source inventory,
green secondary checks, or plausible reasoning into runtime truth.

## Verify without repairing
- Treat the result as an object to verify, not a request to fix. Diagnose/implement only if separately asked.
- Default to read-only inspection and non-destructive validation. Do not deploy, restart, mutate prod data, or run a real external transaction just to get proof.
- Preserve dirty worktrees and live systems. Never mutate git, expose secrets, or print raw env values.
- Same-agent verification is honest verification, not reviewer *independence* — say so if independence is the acceptance bar (use a separate reviewer / the code-review skill).

## Build the proof
1. **Normalize the claim.** Split into atomic material claims without dropping quantifiers, named environments, side effects, or forbidden outcomes. Don't broaden "the tested case works" into "always works," nor narrow a universal claim to the tested slice.
2. **Shortest sufficient evidence ladder** — climb only while an obligation is unresolved: (a) source/config → (b) focused static/type checks → (c) targeted behavioral test / isolated repro → (d) producer↔consumer / integration → (e) actual runtime / user-visible behavior. Higher cost ≠ stronger proof; match signal to claim.
3. **Capture evidence as evidence.** Record target, revision/identity, environment, timestamp, exact non-secret command, result, scope, limitation. Distinguish declared vs implemented vs tested vs observed vs user-visible behavior.
4. **Reconcile contradictions** by directness/freshness/scope — do not vote across sources. Preserve conflicts you can't safely resolve.
5. **Scoped verdicts:** `PROVEN` (direct evidence within scope, no material contradiction) · `PARTIAL` (some obligations met, claim exceeds observed scope) · `UNPROVEN` (evidence absent/inaccessible — not the same as false) · `CONTRADICTED` (direct evidence falsifies a material part). Overall = CONTRADICTED if any material claim contradicted; else PROVEN only if all proven; else PARTIAL if any proven/partial; else UNPROVEN.

## Return a proof capsule (in-conversation)
```text
claim: <original, with material quantifiers>
verified scope: <narrower scope, if any>
target: <env / revision / identity / time>
verdict: PROVEN | PARTIAL | UNPROVEN | CONTRADICTED
atomic claims:
- <claim> — <verdict> — <direct evidence or missing signal>
primary signal: <strongest observation + result>
checks not passed: <failed / blocked / skipped / unavailable>
coverage boundary: <what was not exercised>
reproduction: <exact safe command, when available>
next decisive check: <one minimal check, only if it could change the verdict>
```

## Refuse false closure
Absence claims need an explicit search universe + detection capability. Scheduled delivery needs evidence of the send/receive path, not a healthy scheduler. Deployment readiness needs the actual serving identity + requested behavior, not a passed pipeline. A test inventory proves tests *exist*, not that they *passed*.

> Project note: for this site, the decisive user-visible signal is the browser — the 3D model rebuilds and the price the server confirms matches the price shown — not a green build or a successful deploy.

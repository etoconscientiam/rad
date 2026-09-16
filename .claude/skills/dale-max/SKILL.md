---
name: dale-max
description: High-assurance control loop for consequential work (risky implementation, debugging, migration, audit, delivery) — a Worker produces the artifact and a separate adversarial Reviewer (plus task-derived reviewer subagents) gates it with PASS / REVISE / REJECT / BLOCKED before it ships. Use ONLY when the user explicitly invokes /dale-max or asks for maximum-assurance / adversarially-reviewed work. Never activate implicitly; do not use for routine changes.
---

# Dale Max (Claude-native)

A deliberate, high-assurance loop for consequential work. Adapted from Dale's
resident-Codex-thread model to Claude Code's `Agent`/`Workflow` subagents.
**Requires explicit user invocation.** Do not activate implicitly.

## Roles (mapped to Claude tooling)
- **Worker** — the main loop (you) implements the primary artifact.
- **Reviewer** — a *separate* `Agent` subagent (use `code-reviewer` / `Explore` / `general-purpose`) that reviews adversarially. Independence comes from it being a fresh subagent with its own context, not the same thread self-checking.
- **Ephemeral reviewers** — additional subagents spawned per acceptance lens (correctness, security, contract-fidelity, does-it-reproduce), run in parallel via `Workflow` `parallel()`.

## Phases
1. **Plan** — define observable outcomes, acceptance criteria, forbidden outcomes, and the primary evidence for each. No preset token/reviewer budgets; scale to risk.
2. **Produce** — Worker builds the artifact.
3. **Review** — route the raw artifact directly to the Reviewer subagent(s) *without* Worker spin. Each returns findings against its lens.
4. **Gate** — one verdict: `PASS` (criteria met) · `REVISE` (bounded fix possible) · `REJECT` (structurally wrong, re-plan) · `BLOCKED` (missing authority/dependency — report immediately).
5. **Revise** — feed precise failures back to the Worker. After two failed cycles on the same signal, re-plan rather than repeat.
6. **Compress** — outcome-first handoff: what changed, primary signals, residual risk, follow-ups.

## Constraints
- Never drop a material review lens to save time/tokens.
- Preserve user intent verbatim; redact credentials before any storage or subagent prompt.
- Honor AGENTS.md invariants throughout (no secrets, no unrequested git ops, non-destructive validation).
- If the needed reviewer tooling is unavailable, report the blocker instead of faking independence with a same-context self-review.

# AGENTS.md — RAKURS

Applies to the whole repository unless a deeper `AGENTS.md` overrides it.
Ported from the RPG16 project contract, 2026-09-16, and adapted for RAKURS.

## Goal

Leave the system clearer, more correct, and easier to trust. Answer in the user's language. Verify uncertain claims against code, tests, or runtime output — do not assert what you have not checked.

## Invariants

- Never print or commit secrets, tokens, credentials, or raw `.env` values — anywhere, including fixtures, logs, and screenshots.
- Never stage, commit, amend, rebase, reset, stash, push, or delete files unless explicitly asked.
- Never stop or kill processes to free ports; use isolated ports or config overrides.
- Never hand-edit generated files (including Prisma `migration.sql`); change the declarative source (`schema.prisma`, codegen inputs) and run the generator.
- Never weaken auth, permissions, validation, encryption, rate limits, or auditability to make a task easier.
- Never revert, reformat, or clean up user changes you did not create.
- Do not add CI/CD, deployment pipelines, hosted automation, or release ceremony unless explicitly asked.
- Do not add new production dependencies without explicit approval; prefer existing utilities and the standard library.
- Never write into `_source/**` — those are the customer's original materials (Claude Design export, git sketch). Read-only.
- Never trust a client-computed price. Any order total must be recomputed and validated server-side before persistence or payment.
- Never hardcode rates, size ranges, or lead times into components — they live in config/DB (`docs/02-domain-model.md`).
- Never put user-facing strings in code — all copy goes through the translation files (ka / en / ru).

## Autonomy

- Answer / explain / review / diagnose / plan: inspect the relevant materials and report. Do not implement unless also asked.
- Change / build / fix: make the requested in-scope changes and run non-destructive validation without asking.
- Ask first only for destructive, irreversible, security- or privacy-sensitive actions, external writes, or a material expansion of scope.
- If a safe assumption unblocks work, proceed and state it in the final report.
- When material product or architecture tradeoffs exist, present up to two viable options and recommend one.

## How to work

- Ground in the repository: current code, schemas, tests, and runtime output outrank docs and assumptions. Use the repo's existing package manager, scripts, test runner, formatter, and build tools.
- For changes to behavior, logic, contracts, auth, permissions, persistence, validation, routing, or state transitions, work test-first: highest-value failing case → minimal implementation → green → next case. Start from user-visible or contract-level behavior. If adding a test is disproportionate, say so and use the fastest reliable validation instead.
- Fix the owning layer, not the nearest visible symptom. A bug surfacing in a child component, hook, or helper usually belongs to a parent decision; child-side fallbacks, defensive guards, and duplicated decision logic that hide an upstream mistake are not fixes. A one-file fix for cross-layer behavior is suspicious until proven otherwise.
- When touching a shared boundary (contract, schema, route, guard, query, auth, async workflow), keep both sides consistent: producer and consumer, read and write paths, and the user-visible states they drive (loading, empty, error, success, optimistic, stale).
- If two attempts fail to move the primary signal, stop and reframe instead of patching harder.

## Change quality

- Aim for the smallest coherent change that fully solves the real problem at the owning layer — minimal surface area and abstraction count, not smallest diff at any cost.
- Prefer flat, local, boring code over new layers, helpers, wrappers, and patterns. Small intentional duplication beats the wrong shared abstraction.
- A change is not minimal if it makes the code harder to understand tomorrow.
- If re-architecture or migration is required, state scope, risks, backward compatibility, and rollout order before proceeding.

## Validation and done

- Validate the changed surface with the cheapest sufficient signal first: targeted tests → typecheck / lint → build → wider suites only when needed. If contracts changed, validate both producer and consumer.
- The primary signal is user-visible or contract-level behavior. Green tests, lint, or typecheck alone do not equal success; if only secondary signals were checked, the task is partially validated and must be reported as such.
- Any non-zero exit, runtime error, unhandled rejection, failed assertion, type error, or build failure is failed validation. Report what failed, what it means, and the next useful experiment — never hide it.
- The task is not done if the visible symptom is gone but the same mechanic remains structurally inconsistent across directly coupled layers.

## UI

- Follow the "Karkas" design system (`_source/prototype/_ds/.../readme.md`) and its tokens verbatim; no redesigns unless explicitly asked.
- Token values are copied without alteration. Need a color or size that does not exist? Ask — do not invent one.
- Styling is Tailwind + shadcn/ui, adapted to the design system rather than the other way round. The stated cost of that choice (`docs/04-repo-review.md`, owner's decision of 06.09.2026) is that BEM, Material Design and Ant Design stay out: one styling approach per codebase, never two side by side. Revisiting the choice is the owner's call — silently mixing approaches is not.
- Icons: Lucide only, 1.5px stroke. No emoji, no hand-drawn SVG.
- Shared visual components are closed units (surface, padding, radius, typography belong to the component). Adapt consumers through existing semantic props, then the smallest new semantic prop, then a local wrapper — never visual overrides or ad hoc surfaces.
- Keep layout rhythm on the shared spacing scale via parent padding and container gap, not ad hoc margins.

## Docs and hygiene

- Code is the source of truth. Update `README.md` / `docs/` only when a change materially affects architecture, setup, contracts, operations, or important decisions. Call out doc drift you leave out of scope.
- Requirements live in `docs/04-repo-review.md` (stack, stages), the domain model in `docs/02-domain-model.md`. Changing a price formula, size range, or lead time requires the owner's sign-off first.
- Write docs in Russian, in engineering register — precise names and terms, no metaphors unless the user asks for one.
- Keep temporary artifacts under `./.scratch/`; keep diffs free of unrelated formatting churn.

## Final report

State concisely:

- what changed and why; root cause when identified;
- primary signal status — met, not met, or partially validated — with the exact checks run;
- remaining risks, missing coverage, or follow-ups when relevant;
- a suggested commit message when the change is ready.

---
name: dale-loop
description: Run a closed-loop task cycle — plan → act → validate against a primary signal → correct — repeating until an explicit exit condition (signal met, budget/attempt cap, or a genuine blocker) is reached. Use when the user invokes /dale-loop or wants a task driven to a verified done-state rather than a single pass. Do NOT use for open-ended exploration (use /dale-brainstorm) or a one-shot answer.
---

# Dale Loop (Claude-native)

A disciplined closed loop for driving one task to a *verified* done-state.

## Define the loop up front
- **Objective:** the observable outcome, in one sentence.
- **Primary signal:** the user-visible / contract-level check that proves it (e.g. "the configurator price on screen matches the server-side recalculation for the same config"). Green tests/lint alone are secondary.
- **Exit conditions:** signal met · attempt cap (default 2 failed cycles on the same signal → stop & reframe) · a real blocker needing user input.
- **Guardrails:** honor AGENTS.md invariants (no secrets, no unrequested git ops, no destructive shortcuts).

## Each cycle
1. **Plan** the smallest coherent change at the owning layer.
2. **Act** — make the change / run the step.
3. **Validate** with the cheapest sufficient signal first, ending at the primary signal.
4. **Judge:** met → exit; not met → record what failed and why, then correct. After two failures on the same signal, stop and reframe instead of repeating.

## Between cycles
Keep a one-line running log of: cycle N → change → signal result. Don't hide a non-zero exit, runtime error, or failed assertion — that's a failed cycle.

## Exit report
State: final signal status (met / partial / not met), exact checks run, cycles used, residual risk, and a suggested commit message if the change is ready.

> For recurring *scheduled* runs (poll every N minutes), prefer the built-in `/loop` or `/schedule` skills — this skill is the single-task convergence loop, not a cron.

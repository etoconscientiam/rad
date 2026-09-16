---
name: dale-graph
description: Decompose a request into a small explicit execution graph — nodes (units of work) with dependencies, parallelizable branches, and per-node acceptance signals — then execute it with Claude's Agent/Workflow tools. Use when the user invokes /dale-graph or has a multi-step task that benefits from being mapped before doing. Do NOT use for a single trivial edit or a pure conversation.
---

# Dale Graph (Claude-native)

Turn a request into a minimal directed graph of work, then run it. Adapted from
Dale's Codex orchestration to Claude Code's Agent/Workflow tools.

## 1. Build the graph
- Break the request into the **fewest** nodes that each have one clear deliverable.
- For each node record: goal, inputs, dependencies (which nodes must finish first), and the **acceptance signal** that says it's done.
- Mark which nodes are independent → they can run in parallel.
- Keep it small: if it's under ~3 steps, just do the work; don't ceremony it.

## 2. Show the graph before executing
Present the nodes + dependencies to the user (a Mermaid `flowchart` in a `.md` is ideal for anything non-trivial). Get a nod if the task is consequential or irreversible.

## 3. Execute
- **Independent nodes:** launch as parallel `Agent` subagents in one message (or a `Workflow` `parallel()`/`pipeline()` if there are many).
- **Dependent chain:** run in order; feed each node the prior node's result.
- Each node self-checks against its acceptance signal before its dependents start.
- If a node's signal fails twice, stop and re-plan that branch rather than patching harder (per AGENTS.md).

## 4. Close
Report per-node status (done / failed / skipped) and the overall outcome. Surface any node whose acceptance signal was only partially met — don't report the graph as green if a branch is amber.

---
name: dale-graph
description: "Map a coupled multi-step task into a small execution graph before carrying it out."
---

# Dale Graph

Use when a request has several coupled deliverables and a dependency map will
materially improve sequencing. Do not add graph ceremony to a simple edit or a
pure discussion.

1. Split the work into the fewest useful nodes. For each, name its outcome,
   dependency, and observable acceptance signal.
2. Mark independent nodes only when they do not contend for the same files,
   state, or external authority.
3. Show the graph in the smallest clear form: concise bullets by default, or a
   Mermaid diagram when relationships would otherwise be hard to follow.
4. Execute authorized nodes in dependency order. Delegate independent work only
   when the environment supports it and the request authorizes delegation;
   otherwise perform it sequentially.
5. Report each node as met, partial, blocked, or skipped. Reframe a branch when
   two attempts fail to improve its primary signal.

Ask for a decision only when it changes scope, risk, or authority; do not ask
for confirmation merely because a graph was created.

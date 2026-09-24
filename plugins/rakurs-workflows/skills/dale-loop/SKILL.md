---
name: dale-loop
description: "Drive one implementation or repair task to a verified observable outcome through focused correction cycles."
---

# Dale Loop

Use for a bounded task that should be carried through implementation, validation
and correction rather than stopped at a first pass. It is not a scheduler and
not a workflow for open-ended exploration.

Before changing anything, state the objective, the primary user-visible or
contract-level signal, and the condition that ends the work. Treat tests, lint
and type checks as supporting evidence unless they are themselves the contract.

For each cycle:

1. Make the smallest coherent change at the owning layer.
2. Run the cheapest relevant checks, ending with the primary signal.
3. Record the result honestly. If it is not met, correct the cause rather than
   masking the symptom.

After two failed cycles on the same signal, stop and reframe the approach. On
exit, report the signal status, exact checks, remaining risks, and any next
decision that needs the user.

---
name: dale-visualize
description: Convert complex information (data, a system, a decision, a comparison) into a single standalone, self-contained HTML artifact that renders on its own. Use when the user invokes /dale-visualize or asks to visualize, chart, diagram, or turn something into a shareable visual page. For quick inline charts prefer the display tool; for database schemas use datamodellm; for architecture sketches use excalidraw.
---

# Dale Visualize (Claude-native)

Turn information into one clear, standalone visual artifact.

## Pick the right medium first
- **Inline chart in chat** (fastest) → `mcp__nimbalyst__display_to_user` (bar/line/pie/area/scatter). Prefer this for a single data chart. Read the `dataviz` skill before choosing colors.
- **Flowchart / sequence / class diagram** → a Mermaid fenced block in a `.md`.
- **Architecture / freeform sketch** → an `.excalidraw` file (excalidraw skill).
- **Database schema / ERD** → a `.datamodel` file (datamodellm skill).
- **Rich standalone page** (multiple linked visuals, narrative + charts) → a single self-contained `.html` — this is Dale Visualize's core case.

## Standalone HTML rules
- One file, no external build step. Inline the CSS. If you need a chart lib, load it from a CDN with a graceful fallback, or hand-draw SVG.
- Must render correctly opened directly in a browser (and in light + dark).
- Follow the `dataviz` skill's palette/accessibility guidance — one coherent system, not ad hoc colors.
- Include a short title + one-line "what this shows"; label axes and units; state what any error bars mean.
- Keep it honest: don't invent data points; show gaps as gaps.

## Deliver
Write the file, then reference it as a clickable markdown link. If it's an embeddable custom-editor type, embed it on its own paragraph so it live-renders.

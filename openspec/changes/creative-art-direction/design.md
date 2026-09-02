# Design: Creative Art Direction for Infographic Prompts

## Decision Summary

Strengthen positive composition instructions at two existing LLM seams:

- style-lock generation in `src/lib/server/styleLockService.ts` establishes a reusable aesthetic and composition language;
- per-slide visual-note generation in `src/lib/server/promptGenerator.ts` chooses slide-specific composition.

Provider templates remain the final assembly layer. No schema, route, UI, catalog, or provider integration changes.

## Current Failure Evidence

The latest owner-supplied hook prompt contains:

- `Infographic grid`;
- `six genteng tiles fanned in 3x2 arrangement filling center as dominant focal point`;
- `Warm neutral background, headline top`;
- `Flat bone canvas`;
- `faint charcoal construction grid`;
- `single visual entry point`;
- `secondary items subordinate in scale and tone`;
- exclusions for decorative frames and extra text.

The resulting image is a clean six-item catalogue sheet. It is not evidence of a runtime error. It is evidence that positive composition direction is too literal and minimal for the owner's desired editorial result.

Earlier owner-supplied references show stronger visual devices: large colour fields, diagonal split, bold lines, arrows, badges, texture, shadows, varied scale, and visual contrast. These are visual references only. They do not authorize new engineering facts.

## Prompt Contract Changes

### Style-lock system prompt

Keep the eight labelled aesthetic lines and existing aesthetic-only hard rules. Expand wording so the model describes:

- a coherent editorial composition language suitable for the selected visual form;
- texture, depth, shadow, or surface treatment where appropriate;
- visual rhythm through scale, overlap, direction, framing, or geometric accents;
- a reusable system that keeps palette/type/shape language consistent while allowing slide-specific composition.

State that a style lock is not a fixed layout. Do not mandate one palette, orange/navy, one permanent background, one focal position, or one reference image.

### Visual-note system prompt

Keep current schema and length bounds. Add rules that:

- select composition concept before listing object inventory;
- identify dominant focal entry point and supporting spatial relationship;
- use at least one composition device when useful: split, diagonal, frame, divider, callout, arrow, badge, shadow, texture field, overlap, varied scale, depth, or spatial rhythm;
- avoid default catalogue grids, uniform tiles, centred inventory, fixed `3x2`/`2x3`, or headline-at-top unless semantically required;
- describe arrows as diagrammatic or compositional when allowed, never as carousel navigation;
- keep labels beside the supplied components and keep `on_image_text` as only primary artwork text.

The instruction should not force every slide to use every device. Requiring unnecessary decoration would create another rigid template.

## Provider Exclusions

Retain all existing categories. Clarify wording if needed:

- navigation/UI arrows and indicators remain prohibited;
- arrows in `visual_notes` are permitted only when explicitly diagrammatic or compositional;
- decorative composition devices are not the same as app/browser chrome or carousel UI.

No provider capability is inferred. Prompt wording is guidance, not a compliance guarantee.

## Fact-Fidelity Boundary

Creative art direction MAY choose visual metaphor, shape, colour, texture, shadow, depth, overlap, and spatial relationship. It MUST NOT invent or imply unsupported engineering facts. Labels and claims remain limited to values supplied through existing approved input boundaries.

The existing `assertAestheticOnly` guard remains unchanged. The visual-note JSON parser remains unchanged except for tests if required.

## Testing

Update tests to assert:

- `STYLE_LOCK_SYSTEM_PROMPT` requests editorial composition language, texture/depth, and visual rhythm;
- style lock still contains all eight labelled lines and aesthetic-only restrictions;
- `VISUAL_NOTES_SYSTEM_PROMPT` requests composition concept, spatial relationship, and composition devices;
- visual-note instruction discourages default catalogue grids/fixed `3x2`/`2x3`/centred inventory while allowing semantically required grids;
- arrow boundary distinguishes diagrammatic/compositional arrows from carousel navigation arrows;
- all provider prompts preserve render/context headings, exact text, exclusions, verbatim style lock, canvas, and ratio;
- no new facts, model IDs, provider guarantees, or seed parameters appear.

Run `bun run test`, `bun run check`, `bun run lint`, and `openspec validate creative-art-direction`. Owner must manually test one generated hook with external image tooling because automated tests cannot judge visual creativity.

## Explicit Non-Decisions

- No automatic image generation.
- No fixed creative template copied from Aug 30 reference images.
- No mandatory decorative device on every slide.
- No carousel dots, page indicators, swipe arrows, app/browser chrome, or device frames.
- No new factual content.
- No provider guarantee or deterministic quality claim.
